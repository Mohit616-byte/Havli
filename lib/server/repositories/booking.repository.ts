/**
 * BookingRepository — Supabase PostgreSQL implementation.
 * Uses the atomic reserve_booking() DB function to prevent overbooking.
 * All writes go through supabaseAdmin (service role, bypasses RLS).
 * All reads are also admin-side — ownership is checked in the service layer.
 */

import { supabaseAdmin } from "@/lib/server/supabase";
import type {
  Booking,
  BookingWithEvent,
  BookingStatus,
  PaymentStatus,
  GuestEntry,
} from "@/lib/server/types";

// ──────────────────────────────────────────────────────────────────────────────
// Formatters
// ──────────────────────────────────────────────────────────────────────────────

function formatBooking(row: Record<string, unknown>): Booking {
  return {
    id:            String(row.id),
    eventId:       String(row.event_id),
    userId:        String(row.user_id),
    amount:        Number(row.amount ?? 0),
    status:        (row.status as BookingStatus) ?? "confirmed",
    paymentStatus: (row.payment_status as PaymentStatus) ?? "test_paid",
    createdAt:     String(row.created_at ?? new Date().toISOString()),
    updatedAt:     String(row.updated_at ?? new Date().toISOString()),
  };
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string): string {
  if (!timeStr || !timeStr.includes(":")) return timeStr;
  const parts = timeStr.split(":");
  const hours   = parseInt(parts[0], 10);
  const minutes = parts[1] ? parts[1].slice(0, 2) : "00";
  if (isNaN(hours)) return timeStr;
  const ampm = hours >= 12 ? "PM" : "AM";
  const h12  = hours % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
}

function formatBookingWithEvent(row: Record<string, unknown>): BookingWithEvent {
  const base  = formatBooking(row);
  const event = (row.events as Record<string, unknown>) ?? {};

  const dateStr = String(event.date ?? "");

  return {
    ...base,
    eventTitle:   String(event.title   ?? ""),
    eventDate:    formatDate(dateStr),
    eventDateISO: dateStr,
    eventTime:    formatTime(String(event.start_time ?? "")),
    eventCity:    String(event.city    ?? ""),
    eventArea:    String(event.area    ?? ""),
    eventImage:   String(event.image_url ?? "") ||
                  "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    eventPrice:   Number(event.price   ?? 0),
  };
}

// ──────────────────────────────────────────────────────────────────────────────
// Repository
// ──────────────────────────────────────────────────────────────────────────────

export const bookingRepository = {
  /**
   * Atomically create a booking via the reserve_booking() PostgreSQL function.
   * Returns the new Booking on success, or throws with a code string:
   *   'SOLD_OUT' | 'DUPLICATE' | 'EVENT_NOT_FOUND'
   */
  async create(
    eventId: string,
    userId:  string,
    amount:  number
  ): Promise<Booking> {
    const { data, error } = await supabaseAdmin.rpc("reserve_booking", {
      p_event_id: eventId,
      p_user_id:  userId,
      p_amount:   amount,
    });

    if (error) {
      console.error("[BOOKING RPC ERROR]", error.message);
      throw new Error("SERVER_ERROR");
    }

    const result = String(data ?? "");

    if (result === "SOLD_OUT")         throw new Error("SOLD_OUT");
    if (result === "DUPLICATE")        throw new Error("DUPLICATE");
    if (result === "EVENT_NOT_FOUND")  throw new Error("EVENT_NOT_FOUND");

    // result = 'OK:<uuid>'
    const bookingId = result.replace(/^OK:/, "");

    const { data: row, error: fetchErr } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();

    if (fetchErr || !row) {
      throw new Error("SERVER_ERROR");
    }

    return formatBooking(row as Record<string, unknown>);
  },

  /** Fetch all bookings for a user, with event details joined. */
  async getByUser(userId: string): Promise<BookingWithEvent[]> {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        events (
          title,
          date,
          start_time,
          city,
          area,
          image_url,
          price
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map(formatBookingWithEvent);
  },

  /** Fetch a single booking by ID, verifying it belongs to the given user. */
  async getById(
    bookingId: string,
    userId:    string
  ): Promise<BookingWithEvent | null> {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        *,
        events (
          title,
          date,
          start_time,
          city,
          area,
          image_url,
          price
        )
      `)
      .eq("id", bookingId)
      .eq("user_id", userId)
      .maybeSingle();

    if (error || !data) return null;

    return formatBookingWithEvent(data as Record<string, unknown>);
  },

  /**
   * Fetch current user's booking for a specific event (to check "already booked" state).
   * Returns null if no confirmed booking exists.
   */
  async getUserBookingForEvent(
    eventId: string,
    userId:  string
  ): Promise<Booking | null> {
    const { data } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .eq("status", "confirmed")
      .maybeSingle();

    if (!data) return null;
    return formatBooking(data as Record<string, unknown>);
  },

  /**
   * Count confirmed bookings for an event.
   * Used to compute live available seats: capacity - confirmedCount.
   */
  async countConfirmed(eventId: string): Promise<number> {
    const { count, error } = await supabaseAdmin
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("event_id", eventId)
      .eq("status", "confirmed");

    if (error) return 0;
    return count ?? 0;
  },

  /**
   * Fetch guest list for a specific event.
   * hostId is used to verify ownership — the event must have host_id = hostId.
   * Returns null if the event doesn't belong to this host.
   */
  async getGuests(
    eventId: string,
    hostId:  string
  ): Promise<GuestEntry[] | null> {
    // Verify event ownership first
    const { data: event } = await supabaseAdmin
      .from("events")
      .select("id, host_id")
      .eq("id", eventId)
      .eq("host_id", hostId)
      .maybeSingle();

    if (!event) return null;  // event not found or doesn't belong to this host

    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select(`
        id,
        status,
        created_at,
        profiles (
          name,
          age_range
        )
      `)
      .eq("event_id", eventId)
      .order("created_at", { ascending: true });

    if (error || !data) return [];

    return (data as Record<string, unknown>[]).map((row) => {
      const profile = (row.profiles as Record<string, unknown>) ?? {};
      return {
        bookingId: String(row.id),
        name:      String(profile.name ?? "Guest"),
        ageRange:  profile.age_range ? String(profile.age_range) : undefined,
        status:    (row.status as BookingStatus) ?? "confirmed",
        bookedAt:  String(row.created_at ?? ""),
      };
    });
  },

  /**
   * Fetch all events owned by a host along with their booking counts.
   * Returns an array of { event, confirmedCount }.
   */
  async getHostEvents(hostId: string): Promise<
    Array<{
      id:             string;
      title:          string;
      date:           string;
      dateISO:        string;
      time:           string;
      capacity:       number;
      confirmedCount: number;
      status:         string;
      image:          string;
    }>
  > {
    const { data: events, error } = await supabaseAdmin
      .from("events")
      .select("id, title, date, start_time, capacity, status, image_url")
      .eq("host_id", hostId)
      .order("date", { ascending: true });

    if (error || !events) {
      console.error("[getHostEvents] Supabase error:", error?.message, "| hostId:", hostId);
      return [];
    }

    // Fetch booking counts for all events in one query
    const eventIds = events.map((e: Record<string, unknown>) => String(e.id));

    const { data: counts } = await supabaseAdmin
      .from("bookings")
      .select("event_id")
      .in("event_id", eventIds)
      .eq("status", "confirmed");

    const countMap: Record<string, number> = {};
    if (counts) {
      for (const row of counts as Record<string, unknown>[]) {
        const eid = String(row.event_id);
        countMap[eid] = (countMap[eid] ?? 0) + 1;
      }
    }

    return (events as Record<string, unknown>[]).map((e) => ({
      id:             String(e.id),
      title:          String(e.title ?? ""),
      date:           formatDate(String(e.date ?? "")),
      dateISO:        String(e.date ?? ""),
      time:           formatTime(String(e.start_time ?? "")),
      capacity:       Number(e.capacity ?? 0),
      confirmedCount: countMap[String(e.id)] ?? 0,
      status:         String(e.status ?? ""),
      image:          String(e.image_url ?? "") ||
                      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    }));
  },
};

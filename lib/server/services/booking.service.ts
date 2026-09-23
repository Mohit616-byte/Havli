/**
 * BookingService — business logic for the booking system.
 * Delegates data access to bookingRepository.
 */

import { bookingRepository } from "@/lib/server/repositories/booking.repository";
import { supabaseAdmin }     from "@/lib/server/supabase";
import type {
  Booking,
  BookingWithEvent,
  GuestEntry,
} from "@/lib/server/types";

export const bookingService = {
  /**
   * Create a booking for the authenticated user.
   *
   * Validates:
   *   - event exists and is approved
   *   - user doesn't already have a confirmed booking for this event
   *   - event has available capacity
   *
   * The actual seat reservation is atomic in the DB function reserve_booking().
   * Price is snapshotted at booking time (not recalculated later).
   *
   * Returns { ok, booking } or { ok: false, code, message, status }
   */
  async createBooking(
    eventId: string,
    userId:  string
  ): Promise<
    | { ok: true;  booking: Booking }
    | { ok: false; code: string; message: string; status: number }
  > {
    // 1. Validate eventId format
    if (!eventId || typeof eventId !== "string" || eventId.trim() === "") {
      return { ok: false, code: "VALIDATION_ERROR", message: "Invalid event ID.", status: 400 };
    }

    // 2. Fetch event to validate state and snapshot price
    const { data: event, error: eventErr } = await supabaseAdmin
      .from("events")
      .select("id, status, price, capacity, title")
      .eq("id", eventId)
      .maybeSingle();

    if (eventErr || !event) {
      return { ok: false, code: "NOT_FOUND", message: "Event not found.", status: 404 };
    }

    if (event.status !== "approved") {
      return { ok: false, code: "NOT_FOUND", message: "Event not found.", status: 404 };
    }

    // 3. Snapshot price at booking time (Phase 6: Razorpay will verify payment amount)
    const amount = Number(event.price ?? 0);

    // 4. Attempt atomic reservation
    try {
      const booking = await bookingRepository.create(eventId, userId, amount);
      return { ok: true, booking };
    } catch (err: unknown) {
      const code = err instanceof Error ? err.message : "SERVER_ERROR";

      if (code === "SOLD_OUT") {
        return {
          ok:      false,
          code:    "SOLD_OUT",
          message: "Sorry, this event is sold out.",
          status:  409,
        };
      }

      if (code === "DUPLICATE") {
        return {
          ok:      false,
          code:    "ALREADY_BOOKED",
          message: "You already have a confirmed booking for this event.",
          status:  409,
        };
      }

      if (code === "EVENT_NOT_FOUND") {
        return { ok: false, code: "NOT_FOUND", message: "Event not found.", status: 404 };
      }

      console.error("[BOOKING SERVICE ERROR]", err);
      return {
        ok:      false,
        code:    "SERVER_ERROR",
        message: "Failed to create booking. Please try again.",
        status:  500,
      };
    }
  },

  /** Get all bookings for a user (with event details). */
  async getUserBookings(userId: string): Promise<BookingWithEvent[]> {
    return bookingRepository.getByUser(userId);
  },

  /** Get a single booking by ID — verifies it belongs to the user. */
  async getBookingDetail(
    bookingId: string,
    userId:    string
  ): Promise<BookingWithEvent | null> {
    return bookingRepository.getById(bookingId, userId);
  },

  /**
   * Get the guest list for an event.
   * hostId is used to verify the event is owned by this host.
   * Returns null if the host doesn't own the event.
   */
  async getEventGuests(
    eventId: string,
    hostId:  string
  ): Promise<GuestEntry[] | null> {
    return bookingRepository.getGuests(eventId, hostId);
  },

  /**
   * Get all events owned by a host along with their booking counts.
   */
  async getHostEvents(hostId: string) {
    return bookingRepository.getHostEvents(hostId);
  },

  /**
   * Get the current user's booking for a specific event.
   * Returns null if no confirmed booking exists.
   */
  async getUserBookingForEvent(
    eventId: string,
    userId:  string
  ): Promise<Booking | null> {
    return bookingRepository.getUserBookingForEvent(eventId, userId);
  },

  /**
   * Calculate available spots for an event.
   * Computed from live booking count, not the stored spots_left column.
   */
  async getAvailableSpots(eventId: string, capacity: number): Promise<number> {
    const booked = await bookingRepository.countConfirmed(eventId);
    return Math.max(0, capacity - booked);
  },
};

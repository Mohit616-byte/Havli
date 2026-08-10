/**
 * EventRepository — Supabase PostgreSQL implementation.
 * All queries execute against the Supabase 'events' database table.
 */

import { supabase, supabaseAdmin } from "@/lib/server/supabase";
import type {
  PublicEvent,
  CreateEventInput,
  EventStatus,
} from "@/lib/server/types";

export type EventFilters = {
  city?: string;
  type?: string;
  vibe?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  date?: string;
  status?: EventStatus;
};

// Format database row to PublicEvent shape
function formatPublicEvent(row: Record<string, unknown>): PublicEvent {
  const dateStr = String(row.date || "");
  let dateFormatted = dateStr;
  try {
    if (dateStr) {
      dateFormatted = new Date(dateStr).toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }
  } catch {
    dateFormatted = dateStr;
  }

  let whatToExpectArray: string[] = [];
  if (Array.isArray(row.what_to_expect)) {
    whatToExpectArray = row.what_to_expect.map(String);
  } else if (typeof row.what_to_expect === "string" && row.what_to_expect) {
    whatToExpectArray = row.what_to_expect
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let vibeArray: string[] = [];
  if (Array.isArray(row.vibe)) {
    vibeArray = row.vibe.map(String);
  } else if (typeof row.vibe === "string" && row.vibe) {
    vibeArray = row.vibe
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  let timeFormatted = String(row.start_time || "7:00 PM");
  if (timeFormatted && timeFormatted.includes(":")) {
    const parts = timeFormatted.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parts[1].slice(0, 2) : "00";
    if (!isNaN(hours)) {
      const ampm = hours >= 12 ? "PM" : "AM";
      const h12 = hours % 12 || 12;
      timeFormatted = `${h12}:${minutes} ${ampm}`;
    }
  }

  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description || ""),
    type: String(row.event_type || ""),
    vibe: vibeArray,
    city: String(row.city || ""),
    area: String(row.area || ""),
    date: dateFormatted,
    dateISO: dateStr,
    time: timeFormatted,
    price: Number(row.price || 0),
    capacity: Number(row.capacity || 0),
    spotsLeft:
      row.spots_left !== undefined && row.spots_left !== null
        ? Number(row.spots_left)
        : Number(row.capacity || 0),
    image:
      String(row.image_url || "") ||
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    host: {
      name: String(row.host_name || "Havli Host"),
      verified: Boolean(row.host_verified ?? true),
    },
    whatToExpect: whatToExpectArray,
    safetyNote:
      String(row.safety_note || "") ||
      "Details will be shared with confirmed guests.",
    createdAt: String(row.created_at || new Date().toISOString()),
  };
}

export const eventRepository = {
  /** Fetch approved events from Supabase matching filters */
  async getAll(filters: EventFilters = {}): Promise<PublicEvent[]> {
    const targetStatus = filters.status ?? "approved";

    let query = supabase
      .from("events")
      .select("*")
      .eq("status", targetStatus);

    if (filters.city) {
      query = query.eq("city", filters.city);
    }
    if (filters.type) {
      query = query.ilike("event_type", filters.type);
    }
    if (filters.vibe) {
      query = query.ilike("vibe", `%${filters.vibe}%`);
    }
    if (filters.date) {
      query = query.eq("date", filters.date);
    }
    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters.search) {
      const q = filters.search.trim();
      query = query.or(
        `title.ilike.%${q}%,city.ilike.%${q}%,area.ilike.%${q}%,vibe.ilike.%${q}%,description.ilike.%${q}%`
      );
    }

    query = query.order("date", { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error("Supabase events query error:", error.message);
      return [];
    }

    return (data || []).map(formatPublicEvent);
  },

  /** Fetch single approved event by ID from Supabase */
  async getById(id: string): Promise<PublicEvent | null> {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("status", "approved")
      .maybeSingle();

    if (error || !data) return null;
    return formatPublicEvent(data);
  },

  /** Create new event in Supabase — status ALWAYS forced to 'pending' */
  async create(input: CreateEventInput): Promise<PublicEvent> {
    const payload = {
      title: input.title,
      description: input.description,
      event_type: input.type,
      vibe: input.vibe.join(", "),
      city: input.city,
      area: input.area,
      date: input.dateISO,
      start_time: input.time,
      price: input.price,
      capacity: input.capacity,
      spots_left: input.capacity,
      image_url: input.image,
      what_to_expect: (input.whatToExpect || []).join("\n"),
      status: "pending", // ALWAYS forced
    };

    const { data, error } = await supabaseAdmin
      .from("events")
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to create event in Supabase");
    }

    return formatPublicEvent(data);
  },
};

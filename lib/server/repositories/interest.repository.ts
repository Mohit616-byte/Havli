/**
 * InterestRepository — Supabase implementation.
 * Connects event interest registrations to PostgreSQL `event_interests` table.
 */

import { supabaseAdmin } from "@/lib/server/supabase";
import type { EventInterest, CreateInterestInput } from "@/lib/server/types";

export const interestRepository = {
  /** Create a new interest record in Supabase (requires valid authenticated user_id) */
  async create(input: CreateInterestInput & { userId: string }): Promise<EventInterest> {
    const payload = {
      event_id: input.eventId,
      user_id: input.userId,
      name: input.name,
      phone: input.phone,
      age_range: input.ageRange,
      city: input.cityArea,
      instagram: input.instagram || null,
      reason: input.reason || null,
    };

    const { data, error } = await supabaseAdmin
      .from("event_interests")
      .insert(payload)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to record event interest");
    }

    return {
      id: String(data.id),
      eventId: String(data.event_id),
      userId: String(data.user_id),
      name: String(data.name || ""),
      phone: String(data.phone || ""),
      ageRange: String(data.age_range || ""),
      cityArea: String(data.city || ""),
      instagram: data.instagram ? String(data.instagram) : undefined,
      reason: data.reason ? String(data.reason) : undefined,
      createdAt: String(data.created_at || new Date().toISOString()),
    };
  },

  /** Check for duplicate interest by (eventId, userId) or phone */
  async isDuplicate(eventId: string, phone: string, userId?: string): Promise<boolean> {
    if (userId) {
      const { data } = await supabaseAdmin
        .from("event_interests")
        .select("id")
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

      if (data) return true;
    }

    const normalised = phone.replace(/\s+/g, "");
    const { data } = await supabaseAdmin
      .from("event_interests")
      .select("phone")
      .eq("event_id", eventId);

    if (data && data.length > 0) {
      return data.some(
        (r) => String(r.phone || "").replace(/\s+/g, "") === normalised
      );
    }

    return false;
  },

  /** Get all interests for an event */
  async getByEvent(eventId: string): Promise<EventInterest[]> {
    const { data, error } = await supabaseAdmin
      .from("event_interests")
      .select("*")
      .eq("event_id", eventId);

    if (error || !data) return [];
    return data.map((r) => ({
      id: String(r.id),
      eventId: String(r.event_id),
      userId: String(r.user_id),
      name: String(r.name || ""),
      phone: String(r.phone || ""),
      ageRange: String(r.age_range || ""),
      cityArea: String(r.city || ""),
      instagram: r.instagram ? String(r.instagram) : undefined,
      reason: r.reason ? String(r.reason) : undefined,
      createdAt: String(r.created_at || new Date().toISOString()),
    }));
  },
};

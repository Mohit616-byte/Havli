/**
 * HostSubmissionRepository — Supabase implementation.
 * Inserts and queries the 'host_submissions' PostgreSQL database table.
 */

import { supabase, supabaseAdmin } from "@/lib/server/supabase";
import type {
  HostSubmission,
  CreateSubmissionInput,
  SubmissionStatus,
} from "@/lib/server/types";

function formatSubmission(row: Record<string, unknown>): HostSubmission {
  const hostId = row.host_id ? String(row.host_id) : row.user_id ? String(row.user_id) : undefined;
  const userId = row.user_id ? String(row.user_id) : row.host_id ? String(row.host_id) : undefined;

  return {
    id: String(row.id || ""),
    name: String(row.name || ""),
    phone: String(row.phone || ""),
    instagram: row.instagram ? String(row.instagram) : undefined,
    eventTitle: String(row.event_title || ""),
    eventType: String(row.event_type || ""),
    city: String(row.city || ""),
    area: String(row.area || ""),
    date: String(row.date || ""),
    startTime: String(row.start_time || ""),
    capacity: Number(row.capacity || 0),
    price: Number(row.price || 0),
    vibe: String(row.vibe || ""),
    description: String(row.description || ""),
    image: row.image_url ? String(row.image_url) : undefined,
    status: (row.status as SubmissionStatus) || "pending",
    createdAt: String(row.created_at || new Date().toISOString()),
    hostId,
    userId,
  };
}

export const submissionRepository = {
  /** Create a new host submission in Supabase — status ALWAYS forced to 'pending' */
  async create(input: CreateSubmissionInput): Promise<HostSubmission> {
    const payload: Record<string, unknown> = {
      name: input.name,
      phone: input.phone,
      instagram: input.instagram || null,
      event_title: input.eventTitle,
      event_type: input.eventType,
      city: input.city,
      area: input.area,
      date: input.date,
      start_time: input.startTime,
      capacity: input.capacity,
      price: input.price,
      vibe: input.vibe,
      description: input.description,
      image_url: input.image || null,
      status: "pending", // ALWAYS forced to pending
    };

    // Execute pure INSERT without .select() to respect INSERT-only RLS policy
    const { error } = await supabase.from("host_submissions").insert(payload);

    if (error) {
      console.error("[SUPABASE ERROR] host_submissions insert failed:", error);
      throw new Error(`Supabase Insert Failed: ${error.message}`);
    }

    return {
      id: `sub-${Date.now()}`,
      ...input,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
  },

  /** Get pending submissions from Supabase for admin review */
  async getPending(): Promise<HostSubmission[]> {
    const { data, error } = await supabaseAdmin
      .from("host_submissions")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(formatSubmission);
  },

  /** Get all submissions from Supabase */
  async getAll(): Promise<HostSubmission[]> {
    const { data, error } = await supabaseAdmin
      .from("host_submissions")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(formatSubmission);
  },

  /** Get submission by ID */
  async getById(id: string): Promise<HostSubmission | null> {
    const { data, error } = await supabaseAdmin
      .from("host_submissions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) return null;
    return formatSubmission(data);
  },

  /** Update submission status */
  async updateStatus(
    id: string,
    status: SubmissionStatus
  ): Promise<HostSubmission | null> {
    const { data, error } = await supabaseAdmin
      .from("host_submissions")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .maybeSingle();

    if (error || !data) return null;
    return formatSubmission(data);
  },
};

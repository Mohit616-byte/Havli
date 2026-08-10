/**
 * ProfileRepository — Supabase implementation.
 * Queries and updates the 'profiles' PostgreSQL database table.
 */

import { supabaseAdmin } from "@/lib/server/supabase";
import type {
  UserProfile,
  UpdateProfileInput,
  UserRole,
} from "@/lib/server/types";

function formatProfile(row: Record<string, unknown>): UserProfile {
  let interestsArray: string[] = [];
  if (Array.isArray(row.interests)) {
    interestsArray = row.interests.map(String);
  }

  return {
    id: String(row.id),
    name: String(row.name || ""),
    email: String(row.email || ""),
    phone: row.phone ? String(row.phone) : undefined,
    gender: row.gender ? String(row.gender) : undefined,
    city: row.city ? String(row.city) : undefined,
    area: row.area ? String(row.area) : undefined,
    ageRange: row.age_range ? String(row.age_range) : undefined,
    instagram: row.instagram ? String(row.instagram) : undefined,
    avatarUrl: row.avatar_url ? String(row.avatar_url) : undefined,
    interests: interestsArray,
    role: (row.role as UserRole) || "user",
    createdAt: String(row.created_at || new Date().toISOString()),
    updatedAt: String(row.updated_at || new Date().toISOString()),
  };
}

export const profileRepository = {
  /** Fetch user profile by user ID */
  async getById(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return formatProfile(data);
  },

  /** Update authenticated user profile — STRICTLY WHITELISTS EDITABLE FIELDS (EXCLUDES ROLE) */
  async update(
    userId: string,
    input: UpdateProfileInput
  ): Promise<UserProfile> {
    const payload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (input.name !== undefined) payload.name = input.name;
    if (input.phone !== undefined) payload.phone = input.phone || null;
    if (input.gender !== undefined) payload.gender = input.gender || null;
    if (input.city !== undefined) payload.city = input.city || null;
    if (input.area !== undefined) payload.area = input.area || null;
    if (input.ageRange !== undefined) payload.age_range = input.ageRange || null;
    if (input.instagram !== undefined) payload.instagram = input.instagram || null;
    if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl || null;
    if (input.interests !== undefined) payload.interests = input.interests;

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(payload)
      .eq("id", userId)
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Failed to update profile");
    }

    return formatProfile(data);
  },
};

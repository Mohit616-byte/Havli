/**
 * ProfileRepository — Supabase implementation.
 * Queries and updates the 'profiles' PostgreSQL database table.
 */

import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/lib/server/supabase";
import type {
  UserProfile,
  UpdateProfileInput,
  UserRole,
} from "@/lib/server/types";

const supabaseUrl =
  (process.env.NEXT_PUBLIC_SUPABASE_URL || "https://gclfissygfxfshsvrqnn.supabase.co")
    .trim()
    .replace(/^["']|["']$/g, "");

const supabaseAnonKey =
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "")
    .trim()
    .replace(/^["']|["']$/g, "");

/** Create a Supabase client that runs as the authenticated user (respects RLS, no service role needed) */
function getUserClient(token: string) {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
}

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
  /** Fetch user profile by user ID with automatic fallback profile creation */
  async getById(userId: string, authUser?: any): Promise<UserProfile | null> {
    const { data } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (data) return formatProfile(data);

    // Auto-recovery: If profile row is missing, try to backfill from auth user via admin API
    try {
      let u = authUser;
      if (!u) {
        const { data: authUserData } = await supabaseAdmin.auth.admin.getUserById(userId);
        u = authUserData?.user;
      }

      if (u && (u.id === userId || String(u.id) === String(userId))) {
        const name = u.user_metadata?.name || (u.email ? u.email.split("@")[0] : "User");
        const payload = {
          id: u.id,
          email: u.email,
          name,
          role: "user",
        };
        const { data: createdProfile } = await supabaseAdmin
          .from("profiles")
          .upsert(payload, { onConflict: "id" })
          .select()
          .maybeSingle();

        if (createdProfile) {
          return formatProfile(createdProfile);
        }
      }
    } catch (e) {
      console.error("[PROFILE RECOVERY ERROR]", e);
    }

    return null;
  },

  /**
   * Update authenticated user profile.
   * Uses the user's JWT token to create a user-auth'd client — this works with RLS
   * even without a service role key, as long as the user is authenticated.
   * STRICTLY WHITELISTS EDITABLE FIELDS (EXCLUDES role).
   */
  async update(
    userId: string,
    input: UpdateProfileInput,
    authUser?: any,
    authToken?: string
  ): Promise<UserProfile> {
    const current = await this.getById(userId, authUser);

    // Build base payload — always include id, email, name, and role='user' for INSERT path
    const payload: Record<string, unknown> = {
      id: userId,
      role: current?.role ?? "user", // preserve existing role; default 'user' for new rows
      updated_at: new Date().toISOString(),
    };

    if (current) {
      payload.email = current.email;
      payload.name = current.name;
    } else if (authUser) {
      payload.email = authUser.email;
      payload.name =
        input.name?.trim() ||
        authUser.user_metadata?.name ||
        (authUser.email ? authUser.email.split("@")[0] : "User");
    }

    // Apply whitelisted editable fields
    if (input.name !== undefined) payload.name = input.name;
    if (input.phone !== undefined) payload.phone = input.phone || null;
    if (input.gender !== undefined) payload.gender = input.gender || null;
    if (input.city !== undefined) payload.city = input.city || null;
    if (input.area !== undefined) payload.area = input.area || null;
    if (input.ageRange !== undefined) payload.age_range = input.ageRange || null;
    if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl || null;
    if (input.interests !== undefined) payload.interests = input.interests;

    // Prefer: admin client (bypasses RLS entirely — service role key ignores all policies)
    // Fallback: user-auth'd client (works with RLS via JWT token)
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();

    if (error || !data) {
      // Admin client failed — fall back to user JWT client if token is available
      if (authToken) {
        console.warn("[SUPABASE] Admin upsert failed, retrying with user client:", error?.message);
        const userClient = getUserClient(authToken);
        const { data: retryData, error: retryError } = await userClient
          .from("profiles")
          .upsert(payload, { onConflict: "id" })
          .select()
          .single();

        if (retryError || !retryData) {
          console.error("[SUPABASE ERROR] Profile upsert (user-client retry) failed:", retryError);
          throw new Error(retryError?.message || "Failed to update profile");
        }

        return formatProfile(retryData);
      }

      console.error("[SUPABASE ERROR] Profile upsert failed:", error);
      throw new Error(error?.message || "Failed to update profile");
    }

    return formatProfile(data);
  },
};

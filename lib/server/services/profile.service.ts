/**
 * ProfileService — business logic for user profile management.
 */

import { profileRepository } from "@/lib/server/repositories/profile.repository";
import { check, minLength, isPhone, isAllowedValue } from "@/lib/server/validation";
import { ALLOWED_CITIES, ALLOWED_GENDERS } from "@/lib/server/types";
import type { UserProfile, UpdateProfileInput } from "@/lib/server/types";

const AGE_RANGES = [
  "18–20",
  "21–24",
  "25–29",
  "30+",
  "18-22",
  "23-27",
  "28-32",
  "33-40",
  "40+",
] as const;

export const profileService = {
  async getProfile(userId: string, authUser?: any): Promise<UserProfile | null> {
    return await profileRepository.getById(userId, authUser);
  },

  async validateAndUpdate(
    userId: string,
    input: unknown,
    authUser?: any,
    authToken?: string
  ): Promise<
    | { ok: true; data: UserProfile }
    | { ok: false; status: number; message: string; fields?: Record<string, string> }
  > {
    const body = input as Record<string, unknown>;

    const rules: Record<string, any[]> = {};
    if (body.name !== undefined) rules.name = [minLength("Name", 2)];
    if (body.phone && String(body.phone).trim()) rules.phone = [isPhone("Phone")];
    if (body.city && String(body.city).trim())
      rules.city = [isAllowedValue("City", ALLOWED_CITIES)];
    if (body.ageRange && String(body.ageRange).trim())
      rules.ageRange = [isAllowedValue("Age range", AGE_RANGES)];
    if (body.gender && String(body.gender).trim())
      rules.gender = [isAllowedValue("Gender", ALLOWED_GENDERS)];

    const { valid, errors } = check(body, rules);
    if (!valid) {
      return {
        ok: false,
        status: 400,
        message: "Please check the highlighted fields",
        fields: errors,
      };
    }

    const updateInput: UpdateProfileInput = {
      name: body.name !== undefined ? String(body.name) : undefined,
      phone: body.phone !== undefined ? String(body.phone) : undefined,
      gender: body.gender !== undefined ? String(body.gender) : undefined,
      city: body.city !== undefined ? String(body.city) : undefined,
      area: body.area !== undefined ? String(body.area) : undefined,
      ageRange: body.ageRange !== undefined ? String(body.ageRange) : undefined,
      avatarUrl: body.avatarUrl !== undefined ? String(body.avatarUrl) : undefined,
      interests: Array.isArray(body.interests)
        ? (body.interests as string[]).map(String)
        : undefined,
    };

    try {
      const updated = await profileRepository.update(userId, updateInput, authUser, authToken);
      return { ok: true, data: updated };
    } catch (err: any) {
      console.error("[PROFILE SERVICE ERROR]", err);
      return {
        ok: false,
        status: 500,
        message: err?.message || "Failed to save profile. Please try again.",
      };
    }
  },
};

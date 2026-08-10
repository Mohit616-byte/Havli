import type { UserProfile } from "@/lib/server/types";

/**
 * Checks if the user's profile has completed all REQUIRED fields:
 * - name (min 2 chars)
 * - ageRange
 * - city
 * - area
 * - interests (at least 1 interest selected)
 *
 * Optional fields (gender, phone, instagram, avatarUrl) do NOT block completion.
 */
export function isProfileComplete(profile: UserProfile | null): boolean {
  if (!profile) return false;

  const hasName = Boolean(profile.name && profile.name.trim().length >= 2);
  const hasAge = Boolean(profile.ageRange && profile.ageRange.trim().length > 0);
  const hasCity = Boolean(profile.city && profile.city.trim().length > 0);
  const hasArea = Boolean(profile.area && profile.area.trim().length > 0);
  const hasInterests = Boolean(
    Array.isArray(profile.interests) && profile.interests.length > 0
  );

  return hasName && hasAge && hasCity && hasArea && hasInterests;
}

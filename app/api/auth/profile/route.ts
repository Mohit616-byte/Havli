import type { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { profileService } from "@/lib/server/services/profile.service";
import { ok, badRequest, serverError } from "@/lib/server/response";

/** GET /api/auth/profile — fetch authenticated user profile */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to continue" } },
        { status: 401 }
      );
    }

    const profile = await profileService.getProfile(user.id, user);
    if (!profile) {
      return Response.json(
        { success: false, error: { code: "NOT_FOUND", message: "Profile not found" } },
        { status: 404 }
      );
    }

    return ok({ profile });
  } catch {
    return serverError();
  }
}

/** PUT /api/auth/profile — update authenticated user profile */
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to continue" } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body");

    const result = await profileService.validateAndUpdate(user.id, body, user);

    if (!result.ok) {
      const status = result.status ?? 400;
      return Response.json(
        { success: false, error: { code: status === 500 ? "SERVER_ERROR" : "VALIDATION_ERROR", message: result.message, fields: result.fields } },
        { status }
      );
    }

    return ok({ profile: result.data });
  } catch (err: any) {
    console.error("[PUT /api/auth/profile ERROR]", err);
    return serverError(err?.message || "Failed to save profile. Please try again.");
  }
}

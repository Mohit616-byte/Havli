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

    const profile = await profileService.getProfile(user.id);
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

    const result = await profileService.validateAndUpdate(user.id, body);

    if (!result.ok) {
      return badRequest(result.message, result.fields);
    }

    return ok({ profile: result.data });
  } catch {
    return serverError();
  }
}

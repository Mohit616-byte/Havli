import type { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { interestService } from "@/lib/server/services/interest.service";
import { ok, badRequest, notFound, conflict, serverError } from "@/lib/server/response";

/** POST /api/interests — register interest in an event (authenticated users only) */
export async function POST(request: NextRequest) {
  try {
    // Resolve user ID server-side from auth token — NEVER trust user_id sent in body
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Please log in to continue.",
          },
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body");

    const result = await interestService.validateAndCreate(user.id, body);

    if (!result.ok) {
      if (result.status === 404) return notFound(result.message);
      if (result.status === 409) return conflict(result.message);
      return badRequest(result.message, result.fields);
    }

    return ok({
      success: true,
      message: "Interest registered successfully",
    });
  } catch {
    return serverError();
  }
}

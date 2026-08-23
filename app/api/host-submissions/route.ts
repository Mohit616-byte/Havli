import type { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { submissionService } from "@/lib/server/services/submission.service";
import { created, badRequest, serverError } from "@/lib/server/response";

/** POST /api/host-submissions — submit a new host event request to Supabase */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Please log in to submit a party." },
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body");

    const result = await submissionService.validateAndCreate(body, user.id);

    if (!result.ok) {
      return badRequest(result.message, result.fields);
    }

    return created(result.data);
  } catch (err: any) {
    console.error("[SERVER API ERROR] POST /api/host-submissions:", err?.message || err);
    return serverError();
  }
}

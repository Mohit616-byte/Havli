import type { NextRequest } from "next/server";
import { submissionService } from "@/lib/server/services/submission.service";
import { created, badRequest, serverError } from "@/lib/server/response";

/** POST /api/host-submissions — submit a new host event request to Supabase */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body");

    const result = await submissionService.validateAndCreate(body);

    if (!result.ok) {
      return badRequest(result.message, result.fields);
    }

    return created(result.data);
  } catch (err: any) {
    console.error("[SERVER API ERROR] POST /api/host-submissions:", err?.message || err);
    return serverError();
  }
}

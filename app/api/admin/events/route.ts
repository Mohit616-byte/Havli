import type { NextRequest } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { profileRepository } from "@/lib/server/repositories/profile.repository";
import { submissionRepository } from "@/lib/server/repositories/submission.repository";
import { eventRepository } from "@/lib/server/repositories/event.repository";
import { ok, badRequest, serverError } from "@/lib/server/response";

/** GET /api/admin/events — List pending host submissions for admin review */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in as admin." } },
        { status: 401 }
      );
    }

    const profile = await profileRepository.getById(user.id);
    if (!profile || profile.role !== "admin") {
      return Response.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin authorization required." } },
        { status: 403 }
      );
    }

    const pendingSubmissions = await submissionRepository.getPending();
    return ok({ submissions: pendingSubmissions, events: pendingSubmissions });
  } catch (err: any) {
    console.error("[SERVER API ERROR] GET /api/admin/events:", err?.message || err);
    return serverError();
  }
}

/** PATCH /api/admin/events — Approve or Reject a host submission */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in as admin." } },
        { status: 401 }
      );
    }

    const profile = await profileRepository.getById(user.id);
    if (!profile || profile.role !== "admin") {
      return Response.json(
        { success: false, error: { code: "FORBIDDEN", message: "Admin authorization required." } },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || !body.id || !body.status) {
      return badRequest("Missing id or status in request body");
    }

    const { id, status } = body;
    if (status !== "approved" && status !== "rejected") {
      return badRequest("Status must be either 'approved' or 'rejected'");
    }

    // Fetch the host submission
    const submission = await submissionRepository.getById(id);
    if (!submission) {
      return badRequest("Host submission not found");
    }

    // Duplicate Protection: If submission is already approved
    if (submission.status === "approved") {
      return ok({
        submission,
        message: "Host submission has already been approved.",
      });
    }

    if (status === "approved") {
      // 1. Create corresponding record in events (status = 'approved')
      const publishedEvent = await eventRepository.createFromSubmission(submission);

      // 2. Update host_submissions status to 'approved'
      const updatedSub = await submissionRepository.updateStatus(id, "approved");

      return ok({
        event: publishedEvent,
        submission: updatedSub,
        message: "Submission approved and event successfully published to Explore!",
      });
    } else {
      // Status is 'rejected': Update host_submissions status to 'rejected', DO NOT create event
      const updatedSub = await submissionRepository.updateStatus(id, "rejected");

      return ok({
        submission: updatedSub,
        message: "Host submission rejected.",
      });
    }
  } catch (err: any) {
    console.error("[SERVER API ERROR] PATCH /api/admin/events:", err?.message || err);
    return serverError();
  }
}

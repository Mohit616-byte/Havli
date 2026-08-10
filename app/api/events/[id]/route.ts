import type { NextRequest } from "next/server";
import { eventService } from "@/lib/server/services/event.service";
import { ok, notFound, serverError } from "@/lib/server/response";

type Params = { params: Promise<{ id: string }> };

/** GET /api/events/[id] — single approved event from Supabase or 404 */
export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return notFound("Invalid event ID");
    }

    const event = await eventService.getEvent(id);
    if (!event) return notFound("Event not found");

    return ok({ event });
  } catch {
    return serverError();
  }
}

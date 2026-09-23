import type { NextRequest } from "next/server";
import { getAuthUser }    from "@/lib/supabase/server";
import { bookingService } from "@/lib/server/services/booking.service";
import { ok, notFound, serverError } from "@/lib/server/response";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/host/events/[id]/guests
 * Returns guest list for an event owned by the authenticated host.
 * Backend verifies events.host_id = authenticated user ID.
 * A user cannot see another host's guest list by changing the event ID.
 */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    const { id: eventId } = await context.params;
    const guests = await bookingService.getEventGuests(eventId, user.id);

    if (guests === null) {
      return notFound("Event not found or you don't have access to this event's guest list.");
    }

    return ok({ guests });
  } catch (err: unknown) {
    console.error("[GET /api/host/events/[id]/guests ERROR]", err);
    return serverError();
  }
}

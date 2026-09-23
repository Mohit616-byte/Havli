import type { NextRequest } from "next/server";
import { getAuthUser }    from "@/lib/supabase/server";
import { bookingService } from "@/lib/server/services/booking.service";
import { ok, serverError } from "@/lib/server/response";

/**
 * GET /api/host/events
 * Returns events owned by the authenticated user (host) with booking counts.
 * Works for both role='host' and role='admin'.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    console.log("[GET /api/host/events] auth user.id:", user.id);
    const events = await bookingService.getHostEvents(user.id);
    console.log("[GET /api/host/events] returned events count:", events.length);
    return ok({ events });
  } catch (err: unknown) {
    console.error("[GET /api/host/events ERROR]", err);
    return serverError();
  }
}

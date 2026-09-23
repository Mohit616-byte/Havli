import type { NextRequest } from "next/server";
import { getAuthUser }    from "@/lib/supabase/server";
import { bookingService } from "@/lib/server/services/booking.service";
import { ok, notFound, serverError } from "@/lib/server/response";

type RouteContext = { params: Promise<{ id: string }> };

/** GET /api/bookings/[id] — get a single booking detail (must be own booking) */
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const booking = await bookingService.getBookingDetail(id, user.id);

    if (!booking) return notFound("Booking not found.");

    return ok({ booking });
  } catch (err: unknown) {
    console.error("[GET /api/bookings/[id] ERROR]", err);
    return serverError();
  }
}

import type { NextRequest } from "next/server";
import { getAuthUser }      from "@/lib/supabase/server";
import { bookingService }   from "@/lib/server/services/booking.service";
import { ok, badRequest, serverError } from "@/lib/server/response";

/** POST /api/bookings — create a booking for the authenticated user */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in to book." } },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body.eventId !== "string") {
      return badRequest("eventId is required.");
    }

    const result = await bookingService.createBooking(body.eventId, user.id);

    if (!result.ok) {
      return Response.json(
        { success: false, error: { code: result.code, message: result.message } },
        { status: result.status }
      );
    }

    return ok({ booking: result.booking }, 201);
  } catch (err: unknown) {
    console.error("[POST /api/bookings ERROR]", err);
    return serverError();
  }
}

/** GET /api/bookings — get the current user's bookings */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return Response.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Please log in." } },
        { status: 401 }
      );
    }

    const bookings = await bookingService.getUserBookings(user.id);
    return ok({ bookings });
  } catch (err: unknown) {
    console.error("[GET /api/bookings ERROR]", err);
    return serverError();
  }
}

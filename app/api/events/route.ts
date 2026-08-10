import type { NextRequest } from "next/server";
import { eventService } from "@/lib/server/services/event.service";
import { ok, created, badRequest, serverError } from "@/lib/server/response";

/** GET /api/events — list approved events from Supabase with optional filters */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const events = await eventService.listEvents({
      city: searchParams.get("city") ?? undefined,
      type: searchParams.get("type") ?? undefined,
      vibe: searchParams.get("vibe") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      date: searchParams.get("date") ?? undefined,
    });

    return ok({ events, total: events.length });
  } catch {
    return serverError();
  }
}

/** POST /api/events — create a new event (status: pending) in Supabase */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) return badRequest("Invalid JSON body");

    const result = await eventService.validateAndCreate(body);

    if (!result.valid) {
      return badRequest("Validation failed", result.errors);
    }

    return created({ event: result.data });
  } catch {
    return serverError();
  }
}

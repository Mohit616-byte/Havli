import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eventService }   from "@/lib/server/services/event.service";
import { bookingService } from "@/lib/server/services/booking.service";
import type { PublicEvent } from "@/lib/server/types";
import EventDetailClient from "./EventDetailClient";

// Force dynamic so seat counts are always fresh
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function getEventData(id: string): Promise<PublicEvent | null> {
  try {
    return await eventService.getEvent(id);
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventData(id);
  if (!event) return { title: "Event not found — Havli" };
  return {
    title: `${event.title} — Havli`,
    description: event.description,
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventData(id);
  if (!event) notFound();

  // Compute live available spots from real booking count (not events.spots_left)
  const spotsLeft = await bookingService.getAvailableSpots(event.id, event.capacity);

  return <EventDetailClient event={{ ...event, spotsLeft }} />;
}


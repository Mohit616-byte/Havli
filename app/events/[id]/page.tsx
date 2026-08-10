import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { eventService } from "@/lib/server/services/event.service";
import type { PublicEvent } from "@/lib/server/types";
import EventDetailClient from "./EventDetailClient";

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

export async function generateStaticParams() {
  try {
    const events = await eventService.listEvents({});
    return events.map((e) => ({ id: e.id }));
  } catch {
    return [];
  }
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = await getEventData(id);
  if (!event) notFound();
  return <EventDetailClient event={event} />;
}

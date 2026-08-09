import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EVENTS } from "@/lib/mock-data";
import EventDetailClient from "./EventDetailClient";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);
  if (!event) return { title: "Event not found — Havli" };
  return {
    title: `${event.title} — Havli`,
    description: event.description,
  };
}

export function generateStaticParams() {
  return EVENTS.map((e) => ({ id: e.id }));
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = EVENTS.find((e) => e.id === id);
  if (!event) notFound();
  return <EventDetailClient event={event} />;
}

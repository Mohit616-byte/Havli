import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EVENTS } from "@/lib/mock-data";
import EventGrid from "@/components/events/EventGrid";
import SectionHeading from "@/components/ui/SectionHeading";
import type { PublicEvent } from "@/lib/server/types";

// Map frontend mock Event → PublicEvent shape for EventCard compatibility
function toPublicEvent(e: (typeof EVENTS)[number]): PublicEvent {
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.type,
    vibe: [...e.vibe],
    city: e.city,
    area: e.area,
    date: e.date,
    dateISO: e.dateISO,
    time: e.time,
    price: e.price,
    capacity: e.capacity,
    spotsLeft: e.spotsLeft,
    image: e.image,
    host: { name: e.host.name, verified: e.host.verified },
    whatToExpect: [...e.whatToExpect],
    safetyNote: e.safetyNote,
    createdAt: new Date().toISOString(),
  };
}

export default function FeaturedEvents() {
  const featured = EVENTS.slice(0, 6).map(toPublicEvent);

  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
        <SectionHeading
          eyebrow="Featured events"
          title="Happening this weekend"
          subtitle="Curated events across NCR — from intimate house parties to open meetups."
        />
        <Link
          href="/explore"
          className="shrink-0 flex items-center gap-1.5 text-sm font-semibold text-[var(--color-primary)] hover:gap-2.5 transition-all duration-200"
        >
          See all events <ArrowRight size={15} />
        </Link>
      </div>

      <EventGrid events={featured} />
    </section>
  );
}

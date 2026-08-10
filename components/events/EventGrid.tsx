import EventCard from "./EventCard";
import type { PublicEvent } from "@/lib/server/types";

type EventGridProps = {
  events: PublicEvent[];
  className?: string;
};

export default function EventGrid({ events, className = "" }: EventGridProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-5xl mb-4">🔍</p>
        <p className="text-[var(--color-foreground)] font-semibold text-lg">No events found</p>
        <p className="text-[var(--color-muted)] text-sm mt-2">
          Try adjusting your filters or check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 ${className}`}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Calendar, Clock, Users } from "lucide-react";
import type { Event } from "@/lib/mock-data";

type EventCardProps = {
  event: Event;
};

export default function EventCard({ event }: EventCardProps) {
  const formattedPrice = event.price === 0 ? "Free" : `₹${event.price}`;

  return (
    <Link
      href={`/events/${event.id}`}
      className="group block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] hover:border-[var(--color-border-light)]"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-[var(--color-surface-2)]">
        <Image
          src={event.image}
          alt={event.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Price badge */}
        <div className="absolute top-3 left-3">
          <span className="bg-[var(--color-background)]/80 backdrop-blur-sm text-[var(--color-foreground)] text-xs font-bold px-2.5 py-1.5 rounded-full border border-[var(--color-border)]">
            {formattedPrice}
          </span>
        </div>

        {/* Verified badge */}
        {event.host.verified && (
          <div className="absolute top-3 right-3">
            <span className="bg-[var(--color-primary)]/90 backdrop-blur-sm text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1">
              <BadgeCheck size={11} />
              Verified
            </span>
          </div>
        )}

        {/* Vibe chips on image bottom */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1">
          {event.vibe.slice(0, 2).map((v) => (
            <span
              key={v}
              className="bg-black/50 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-0.5 rounded-full border border-white/10"
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-[var(--color-foreground)] text-base leading-snug mb-1 group-hover:text-[var(--color-primary)] transition-colors">
          {event.title}
        </h3>
        <p className="text-xs text-[var(--color-muted)] mb-3">
          {event.area}, {event.city}
        </p>

        <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
          <span className="flex items-center gap-1">
            <Calendar size={11} />
            {event.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={11} />
            {event.time}
          </span>
          <span className="flex items-center gap-1 ml-auto">
            <Users size={11} />
            {event.spotsLeft} left
          </span>
        </div>
      </div>
    </Link>
  );
}

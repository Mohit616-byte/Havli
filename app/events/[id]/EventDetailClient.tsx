"use client";

import { useState } from "react";
import Image from "next/image";
import {
  BadgeCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  ArrowLeft,
} from "lucide-react";
import type { PublicEvent } from "@/lib/server/types";
import Button from "@/components/ui/Button";
import InterestModal from "@/components/events/InterestModal";

type Props = { event: PublicEvent };

export default function EventDetailClient({ event }: Props) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen pt-16">
        {/* Hero image */}
        <div className="relative h-72 sm:h-96 md:h-[28rem] w-full bg-[var(--color-surface-2)]">
          <Image
            src={event.image}
            alt={event.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)] via-[var(--color-background)]/20 to-transparent" />
          <div className="absolute top-6 left-4 sm:left-6">
            <Button href="/explore" variant="secondary" size="sm">
              <ArrowLeft size={14} /> Back
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24 -mt-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {event.vibe.map((v) => (
                    <span
                      key={v}
                      className="text-xs font-semibold px-3 py-1 rounded-full bg-[var(--color-primary-muted)] text-[var(--color-primary)] border border-[var(--color-primary)]/20"
                    >
                      {v}
                    </span>
                  ))}
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)] leading-tight">
                  {event.title}
                </h1>
                <p className="mt-2 flex items-center gap-1.5 text-[var(--color-muted)] text-sm">
                  <MapPin size={14} />
                  {event.area}, {event.city}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: Calendar, label: "Date", value: event.date },
                  { icon: Clock, label: "Time", value: event.time },
                  { icon: Users, label: "Capacity", value: `${event.capacity} people` },
                  { icon: Users, label: "Spots left", value: `${event.spotsLeft} remaining` },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3"
                  >
                    <p className="text-xs text-[var(--color-muted)] mb-1 flex items-center gap-1">
                      <Icon size={11} />
                      {label}
                    </p>
                    <p className="text-sm font-semibold text-[var(--color-foreground)]">{value}</p>
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-3">
                  About this event
                </h2>
                <p className="text-[var(--color-muted)] leading-relaxed">{event.description}</p>
              </div>

              {event.whatToExpect.length > 0 && (
                <div>
                  <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-3">
                    What to expect
                  </h2>
                  <ul className="space-y-2.5">
                    {event.whatToExpect.map((item) => (
                      <li key={item} className="flex items-start gap-3 text-sm text-[var(--color-muted)]">
                        <span className="text-[var(--color-primary)] mt-0.5 shrink-0">●</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5">
                <h2 className="text-sm font-bold text-[var(--color-foreground)] mb-2 flex items-center gap-2">
                  <Shield size={15} className="text-[var(--color-primary)]" />
                  Safety information
                </h2>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                  {event.safetyNote}
                </p>
              </div>

              {/* Mobile CTA */}
              <div className="lg:hidden">
                <Button fullWidth size="lg" onClick={() => setModalOpen(true)}>
                  I&apos;m Interested — {event.price === 0 ? "Free" : `₹${event.price}`}
                </Button>
              </div>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="sticky top-24 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-5">
                <div>
                  <p className="text-xs text-[var(--color-muted)] mb-1">Entry</p>
                  <p className="text-3xl font-black text-[var(--color-foreground)]">
                    {event.price === 0 ? "Free" : `₹${event.price}`}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] mt-1">per person</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-[var(--color-muted)] mb-1.5">
                    <span>{event.spotsLeft} spots left</span>
                    <span>{event.capacity} total</span>
                  </div>
                  <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-primary)] rounded-full"
                      style={{
                        width: `${((event.capacity - event.spotsLeft) / event.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <Button fullWidth size="lg" onClick={() => setModalOpen(true)}>
                  I&apos;m Interested
                </Button>

                <div className="pt-4 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-muted)] mb-3">Hosted by</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[var(--color-primary-muted)] flex items-center justify-center text-sm font-bold text-[var(--color-primary)]">
                      {event.host.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-foreground)] flex items-center gap-1.5">
                        {event.host.name}
                        {event.host.verified && (
                          <BadgeCheck size={14} className="text-[var(--color-primary)]" />
                        )}
                      </p>
                      <p className="text-xs text-[var(--color-muted)]">
                        {event.host.verified ? "Verified host" : "Host"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <InterestModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        eventId={event.id}
        eventTitle={event.title}
      />
    </>
  );
}

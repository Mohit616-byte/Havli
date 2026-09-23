"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  BadgeCheck,
  Calendar,
  Clock,
  MapPin,
  Users,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Ticket,
  Loader2,
} from "lucide-react";
import type { PublicEvent } from "@/lib/server/types";
import Button from "@/components/ui/Button";
import { useAuth } from "@/components/providers/AuthProvider";
import { createBrowserClient } from "@/lib/supabase/client";

type BookingState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "success"; bookingId: string }
  | { phase: "error"; message: string };

type Props = { event: PublicEvent };

export default function EventDetailClient({ event }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bookingState, setBookingState] = useState<BookingState>({ phase: "idle" });
  const [alreadyBooked, setAlreadyBooked] = useState<string | null>(null); // bookingId if booked

  const spotsLeft = event.spotsLeft;
  const isSoldOut = spotsLeft <= 0;

  // Check if current user already has a booking for this event
  useEffect(() => {
    let cancelled = false;

    async function checkBooking() {
      if (!user) {
        setAlreadyBooked(null);
        return;
      }

      try {
        const supabase = createBrowserClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled || !session?.access_token) return;

        const res = await fetch("/api/bookings", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        if (res.ok && !cancelled) {
          const json = await res.json();
          const existing = (json.data?.bookings ?? []).find(
            (b: { eventId: string; status: string; id: string }) =>
              b.eventId === event.id && b.status === "confirmed"
          );
          if (existing && !cancelled) {
            setAlreadyBooked(existing.id);
          }
        }
      } catch (err) {
        console.error("[EVENT DETAIL] Check booking error:", err);
      }
    }

    if (!authLoading) {
      checkBooking();
    }

    return () => { cancelled = true; };
  }, [event.id, user, authLoading]);

  const handleBook = async () => {
    if (authLoading) return;

    // Not logged in → redirect to login
    if (!user) {
      router.push(`/login?next=/events/${event.id}`);
      return;
    }

    setBookingState({ phase: "loading" });

    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setBookingState({ phase: "error", message: "Session expired. Please log in again." });
        return;
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ eventId: event.id }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg = json?.error?.message ?? "Failed to book. Please try again.";
        setBookingState({ phase: "error", message: msg });
        return;
      }

      const bookingId = json.data?.booking?.id ?? "";
      setBookingState({ phase: "success", bookingId });
      setAlreadyBooked(bookingId);
    } catch {
      setBookingState({ phase: "error", message: "Network error. Please try again." });
    }
  };


  // ── Seat bar ────────────────────────────────────────────────────────────────
  const filledPct = Math.min(
    100,
    ((event.capacity - spotsLeft) / event.capacity) * 100
  );

  const spotLabel = isSoldOut
    ? "Sold Out"
    : spotsLeft === 1
    ? "1 spot left!"
    : spotsLeft <= 5
    ? `${spotsLeft} spots left`
    : `${spotsLeft} spots left`;

  const spotLabelColor = isSoldOut
    ? "text-red-400"
    : spotsLeft <= 5
    ? "text-amber-400"
    : "text-[var(--color-muted)]";

  // ── CTA rendering ───────────────────────────────────────────────────────────
  function renderCTA(fullWidth = false) {
    // Success state (just booked)
    if (bookingState.phase === "success") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-4">
            <CheckCircle2 className="text-emerald-400 shrink-0" size={22} />
            <div>
              <p className="text-sm font-bold text-emerald-400">You&apos;re booked! 🎉</p>
              <p className="text-xs text-[var(--color-muted)] mt-0.5 font-mono">
                #{bookingState.bookingId.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <Button
            href={`/bookings/${bookingState.bookingId}`}
            variant="secondary"
            fullWidth={fullWidth}
            size="lg"
          >
            <Ticket size={16} className="mr-1" />
            View My Booking
          </Button>
        </div>
      );
    }

    // Already booked (from initial check)
    if (alreadyBooked && bookingState.phase === "idle") {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
            <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
            <p className="text-sm font-semibold text-emerald-400">You&apos;re booked for this event ✓</p>
          </div>
          <Button
            href={`/bookings/${alreadyBooked}`}
            variant="secondary"
            fullWidth={fullWidth}
            size="lg"
          >
            <Ticket size={16} className="mr-1" />
            View My Booking
          </Button>
        </div>
      );
    }

    // Sold out
    if (isSoldOut) {
      return (
        <Button fullWidth={fullWidth} size="lg" disabled>
          Sold Out
        </Button>
      );
    }

    // Loading state (auth check)
    if (authLoading) {
      return (
        <Button fullWidth={fullWidth} size="lg" disabled>
          <Loader2 size={16} className="animate-spin mr-2" />
          Loading...
        </Button>
      );
    }

    // Error state
    if (bookingState.phase === "error") {
      return (
        <div className="space-y-2.5">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-sm text-red-400">{bookingState.message}</p>
          </div>
          <Button
            fullWidth={fullWidth}
            size="lg"
            onClick={() => { setBookingState({ phase: "idle" }); handleBook(); }}
            disabled={false}
          >
            Try Again
          </Button>
        </div>
      );
    }

    // Main CTA
    const isLoading = bookingState.phase === "loading";
    const priceLabel = event.price === 0 ? "Free" : `₹${event.price}`;

    return (
      <Button
        fullWidth={fullWidth}
        size="lg"
        onClick={handleBook}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin mr-2" />
            Booking...
          </>
        ) : !user ? (
          "Log in to Book"
        ) : (
          `Book Your Spot · ${priceLabel}`
        )}
      </Button>
    );
  }

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
                  { icon: Calendar, label: "Date",      value: event.date },
                  { icon: Clock,    label: "Time",      value: event.time },
                  { icon: Users,    label: "Capacity",  value: `${event.capacity} people` },
                  {
                    icon:  Users,
                    label: "Spots left",
                    value: isSoldOut ? "Sold Out" : `${spotsLeft} remaining`,
                  },
                ].map(({ icon: Icon, label, value }) => (
                  <div
                    key={label}
                    className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-3"
                  >
                    <p className="text-xs text-[var(--color-muted)] mb-1 flex items-center gap-1">
                      <Icon size={11} />
                      {label}
                    </p>
                    <p className={`text-sm font-semibold ${isSoldOut && label === "Spots left" ? "text-red-400" : "text-[var(--color-foreground)]"}`}>
                      {value}
                    </p>
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
                {renderCTA(true)}
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

                {/* Capacity bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={`font-semibold ${spotLabelColor}`}>{spotLabel}</span>
                    <span className="text-[var(--color-muted)]">{event.capacity} total</span>
                  </div>
                  <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isSoldOut ? "bg-red-500" : spotsLeft <= 5 ? "bg-amber-500" : "bg-[var(--color-primary)]"
                      }`}
                      style={{ width: `${filledPct}%` }}
                    />
                  </div>
                </div>

                {renderCTA(true)}

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
    </>
  );
}

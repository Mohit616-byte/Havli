"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Ticket,
  Info,
} from "lucide-react";
import type { BookingWithEvent, BookingStatus } from "@/lib/server/types";
import Button from "@/components/ui/Button";

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={14} /> Booking Confirmed
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle size={14} /> Cancelled
      </span>
    );
  }
  return (
    <span className="text-sm font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]">
      {status}
    </span>
  );
}

type PageProps = { params: Promise<{ id: string }> };

export default function BookingDetailPage({ params }: PageProps) {
  const router = useRouter();
  const { id: bookingId } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [booking, setBooking]   = useState<BookingWithEvent | null>(null);
  const [loading, setLoading]   = useState(true);
  const [notFound, setNotFound] = useState(false);
  const fetchedIdRef = useRef<string | null>(null);

  const fetchBooking = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoading(false);
        router.push("/login");
        return;
      }

      const res = await fetch(`/api/bookings/${id}`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (res.status === 404 || !res.ok) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      const json = await res.json();
      setBooking(json.data?.booking ?? null);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (bookingId && fetchedIdRef.current !== bookingId) {
      fetchedIdRef.current = bookingId;
      fetchBooking(bookingId);
    }
  }, [authLoading, user, bookingId, router, fetchBooking]);

  if (authLoading || (loading && !notFound && !booking)) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--color-surface-2)] rounded w-1/2" />
          <div className="h-72 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
        </div>
      </div>
    );
  }

  if (notFound || !booking) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-lg mx-auto text-center space-y-4">
        <h1 className="text-2xl font-black text-[var(--color-foreground)]">Booking not found</h1>
        <p className="text-[var(--color-muted)]">This booking doesn&apos;t exist or doesn&apos;t belong to your account.</p>
        <Button href="/bookings">← My Bookings</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-lg mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Button href="/bookings" variant="secondary" size="sm">
          <ArrowLeft size={14} /> My Bookings
        </Button>
      </div>

      {/* Status */}
      <div className="mb-6">
        <StatusBadge status={booking.status} />
      </div>

      {/* Event image */}
      <div className="relative w-full h-52 rounded-2xl overflow-hidden bg-[var(--color-surface-2)] mb-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={booking.eventImage}
          alt={booking.eventTitle}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-background)]/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h1 className="text-2xl font-black text-white leading-tight drop-shadow-lg">
            {booking.eventTitle}
          </h1>
        </div>
      </div>

      {/* Details card */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[var(--color-muted)]">
          Booking Details
        </h2>

        <div className="space-y-3">
          {[
            { icon: Calendar, label: "Date",     value: booking.eventDate },
            { icon: Clock,    label: "Time",     value: booking.eventTime },
            { icon: MapPin,   label: "Location", value: `${booking.eventArea}, ${booking.eventCity}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-primary)] shrink-0">
                <Icon size={15} />
              </div>
              <div>
                <p className="text-xs text-[var(--color-muted)]">{label}</p>
                <p className="text-sm font-semibold text-[var(--color-foreground)]">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-[var(--color-border)] pt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[var(--color-muted)]">Amount</span>
            <span className="text-xl font-black text-[var(--color-foreground)]">
              {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--color-muted)]">Payment</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Test Booking
            </span>
          </div>
        </div>

        <div className="border-t border-[var(--color-border)] pt-4">
          <div className="flex items-center gap-2 mb-1">
            <Ticket size={14} className="text-[var(--color-primary)]" />
            <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider">
              Booking ID
            </span>
          </div>
          <p className="font-mono text-sm text-[var(--color-foreground)] select-all">
            {booking.id}
          </p>
          <p className="text-xs text-[var(--color-muted)] mt-1">
            Booked on {new Date(booking.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric"
            })}
          </p>
        </div>
      </div>

      {/* Test payment disclaimer */}
      <div className="mt-4 bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-xl px-4 py-3 flex gap-2">
        <Info size={15} className="text-[var(--color-muted)] shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-muted)] leading-relaxed">
          This is a <strong>demo booking</strong> — no real payment has been processed.
          Razorpay payment will be added in a future release.
        </p>
      </div>

      <div className="mt-6">
        <Button href={`/events/${booking.eventId}`} variant="secondary" fullWidth>
          View Event
        </Button>
      </div>
    </div>
  );
}

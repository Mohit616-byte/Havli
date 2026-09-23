"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Calendar,
  Clock,
  MapPin,
  Ticket,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ArrowRight,
} from "lucide-react";
import type { BookingWithEvent, BookingStatus } from "@/lib/server/types";
import Button from "@/components/ui/Button";

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={11} /> Booked
      </span>
    );
  }
  if (status === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
        <XCircle size={11} /> Cancelled
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] border border-[var(--color-border)]">
      {status}
    </span>
  );
}

export default function MyBookingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [bookings, setBookings]   = useState<BookingWithEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setBookings([]);
        setLoading(false);
        return;
      }

      const res = await fetch("/api/bookings", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Failed to load bookings.");
        setLoading(false);
        return;
      }

      setBookings(json.data?.bookings ?? []);
    } catch (err) {
      console.error("[MY BOOKINGS] Fetch error:", err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchBookings();
    }
  }, [authLoading, user, router, fetchBookings]);

  if (authLoading || (loading && bookings.length === 0 && !error)) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--color-surface-2)] rounded w-1/3" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] mb-1 flex items-center gap-1.5">
            <Ticket size={13} /> My Activity
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-[var(--color-foreground)]">
            My Bookings
          </h1>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchBookings} disabled={loading}>
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] mx-auto">
            <Ticket size={28} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)]">No bookings yet</h2>
          <p className="text-sm text-[var(--color-muted)] max-w-xs mx-auto">
            Explore parties near you and book your first spot.
          </p>
          <Button href="/explore" size="lg">
            Explore Events <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/bookings/${booking.id}`}
              className="group flex flex-col sm:flex-row gap-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden hover:border-[var(--color-primary)]/40 transition-all duration-200"
            >
              {/* Event image */}
              <div className="relative w-full sm:w-44 h-40 sm:h-auto shrink-0 bg-[var(--color-surface-2)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={booking.eventImage}
                  alt={booking.eventTitle}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Details */}
              <div className="flex-1 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <StatusBadge status={booking.status} />
                    <h3 className="text-lg font-bold text-[var(--color-foreground)] mt-2 leading-tight group-hover:text-[var(--color-primary)] transition-colors">
                      {booking.eventTitle}
                    </h3>
                  </div>
                  <p className="text-lg font-black text-[var(--color-foreground)] shrink-0">
                    {booking.amount === 0 ? "Free" : `₹${booking.amount}`}
                  </p>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
                  <span className="flex items-center gap-1">
                    <MapPin size={11} /> {booking.eventArea}, {booking.eventCity}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {booking.eventDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {booking.eventTime}
                  </span>
                </div>

                <p className="text-xs text-[var(--color-muted)] font-mono">
                  Booking #{booking.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}


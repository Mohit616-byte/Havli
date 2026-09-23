"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/components/providers/AuthProvider";
import { createBrowserClient } from "@/lib/supabase/client";
import {
  Calendar,
  Users,
  ArrowRight,
  RefreshCw,
  Sparkles,
  LayoutDashboard,
} from "lucide-react";
import Button from "@/components/ui/Button";

type HostEvent = {
  id:             string;
  title:          string;
  date:           string;
  dateISO:        string;
  time:           string;
  capacity:       number;
  confirmedCount: number;
  status:         string;
  image:          string;
};

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved:  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
    rejected:  "bg-red-500/10 text-red-400 border-red-500/20",
    cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
    completed: "bg-[var(--color-surface-2)] text-[var(--color-muted)] border-[var(--color-border)]",
  };
  return (
    <span className={`inline-flex text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${map[status] ?? map.pending}`}>
      {status}
    </span>
  );
}

export default function HostDashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();

  const [events, setEvents]   = useState<HostEvent[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const hasFetchedRef = useRef(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createBrowserClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setLoading(false);
        router.push("/login");
        return;
      }

      const res = await fetch("/api/host/events", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error?.message ?? "Failed to load events.");
        setLoading(false);
        return;
      }
      setEvents(json.data?.events ?? []);
    } catch (err) {
      console.error("[HOST DASHBOARD] Fetch error:", err);
      setError("Network error. Please try again.");
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

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchEvents();
    }
  }, [authLoading, user, router, fetchEvents]);

  if (authLoading || (loading && events.length === 0 && !error)) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-4xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-[var(--color-surface-2)] rounded w-1/3" />
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-border)] mb-8">
        <div>
          <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <LayoutDashboard size={13} /> Host Dashboard
          </span>
          <h1 className="text-3xl font-black text-[var(--color-foreground)]">
            My Events
          </h1>
          <p className="text-sm text-[var(--color-muted)] mt-1">
            {profile?.name ? `Welcome, ${profile.name}` : "Manage your events and guests"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchEvents} disabled={loading}>
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </Button>
          <Button href="/host" size="sm">
            <Sparkles size={14} className="mr-1" /> Submit New Event
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] mx-auto">
            <Calendar size={28} />
          </div>
          <h2 className="text-xl font-bold text-[var(--color-foreground)]">No events yet</h2>
          <p className="text-sm text-[var(--color-muted)] max-w-xs mx-auto">
            Submit your first event for review. Once approved, guests can start booking.
          </p>
          <Button href="/host" size="lg">
            Host an Event <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => {
            const spotsLeft = event.capacity - event.confirmedCount;
            const fillPct   = Math.min(100, (event.confirmedCount / event.capacity) * 100);

            return (
              <div
                key={event.id}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-0">
                  {/* Image */}
                  <div className="relative w-full sm:w-40 h-36 sm:h-auto shrink-0 bg-[var(--color-surface-2)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <StatusPill status={event.status} />
                        </div>
                        <h3 className="text-lg font-bold text-[var(--color-foreground)] leading-tight">
                          {event.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={11} />
                        <strong className="text-[var(--color-foreground)]">{event.confirmedCount}</strong>
                        &nbsp;/ {event.capacity} booked
                        &nbsp;·&nbsp;
                        <span className={spotsLeft <= 0 ? "text-red-400 font-semibold" : spotsLeft <= 5 ? "text-amber-400 font-semibold" : ""}>
                          {spotsLeft <= 0 ? "Sold Out" : `${spotsLeft} left`}
                        </span>
                      </span>
                    </div>

                    {/* Booking progress bar */}
                    <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          spotsLeft <= 0 ? "bg-red-500" : spotsLeft <= 5 ? "bg-amber-500" : "bg-[var(--color-primary)]"
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                {event.status === "approved" && (
                  <div className="border-t border-[var(--color-border)] px-5 py-3 flex items-center justify-between">
                    <p className="text-xs text-[var(--color-muted)]">
                      {event.confirmedCount} confirmed guest{event.confirmedCount !== 1 ? "s" : ""}
                    </p>
                    <Link
                      href={`/host/dashboard/${event.id}/guests`}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      View Guests <ArrowRight size={12} />
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


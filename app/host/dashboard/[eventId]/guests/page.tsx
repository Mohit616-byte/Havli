"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { createBrowserClient } from "@/lib/supabase/client";
import { ArrowLeft, Users, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import type { GuestEntry, BookingStatus } from "@/lib/server/types";
import Button from "@/components/ui/Button";

function StatusBadge({ status }: { status: BookingStatus }) {
  if (status === "confirmed") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 size={9} /> Confirmed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
      <XCircle size={9} /> {status}
    </span>
  );
}

type PageProps = { params: Promise<{ eventId: string }> };

export default function GuestListPage({ params }: PageProps) {
  const router = useRouter();
  const { eventId } = use(params);
  const { user, loading: authLoading } = useAuth();

  const [guests, setGuests]   = useState<GuestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const fetchedEventIdRef = useRef<string | null>(null);

  const fetchGuests = useCallback(async (eid: string) => {
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

      const res = await fetch(`/api/host/events/${eid}/guests`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const json = await res.json();

      if (res.status === 404) {
        setError("Event not found or you don't own this event.");
        setLoading(false);
        return;
      }
      if (!res.ok) {
        setError(json.error?.message ?? "Failed to load guest list.");
        setLoading(false);
        return;
      }
      setGuests(json.data?.guests ?? []);
    } catch (err) {
      console.error("[GUEST LIST] Fetch error:", err);
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

    if (eventId && fetchedEventIdRef.current !== eventId) {
      fetchedEventIdRef.current = eventId;
      fetchGuests(eventId);
    }
  }, [authLoading, user, eventId, router, fetchGuests]);

  const confirmedCount = guests.filter((g) => g.status === "confirmed").length;

  if (authLoading || (loading && guests.length === 0 && !error)) {
    return (
      <div className="min-h-screen pt-28 pb-16 px-4 max-w-2xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--color-surface-2)] rounded w-1/2" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-2xl mx-auto">
      {/* Back */}
      <div className="mb-6">
        <Button href="/host/dashboard" variant="secondary" size="sm">
          <ArrowLeft size={14} /> My Events
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between gap-4 pb-5 border-b border-[var(--color-border)] mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)] mb-1 flex items-center gap-1.5">
            <Users size={13} /> Guest List
          </p>
          <h1 className="text-2xl font-black text-[var(--color-foreground)]">
            {confirmedCount} Confirmed Guest{confirmedCount !== 1 ? "s" : ""}
          </h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => eventId && fetchGuests(eventId)}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {!error && guests.length === 0 ? (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-10 text-center space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--color-surface-2)] text-[var(--color-muted)] mx-auto">
            <Users size={24} />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-foreground)]">No guests yet</h2>
          <p className="text-sm text-[var(--color-muted)]">
            Once guests start booking, they&apos;ll appear here.
          </p>
        </div>
      ) : (
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-3 px-5 py-3 border-b border-[var(--color-border)] text-xs font-semibold uppercase tracking-wider text-[var(--color-muted)]">
            <div className="col-span-5">Name</div>
            <div className="col-span-2 hidden sm:block">Age</div>
            <div className="col-span-4 sm:col-span-3">Status</div>
            <div className="col-span-3 sm:col-span-2 text-right">Booking ID</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[var(--color-border)]">
            {guests.map((guest, idx) => (
              <div
                key={guest.bookingId}
                className={`grid grid-cols-12 gap-3 px-5 py-4 items-center text-sm transition-colors ${
                  idx % 2 === 0 ? "" : "bg-[var(--color-surface-2)]/30"
                }`}
              >
                <div className="col-span-5 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[var(--color-primary-muted)] flex items-center justify-center text-xs font-bold text-[var(--color-primary)] shrink-0">
                    {guest.name[0]?.toUpperCase() ?? "?"}
                  </div>
                  <span className="font-semibold text-[var(--color-foreground)] truncate">
                    {guest.name}
                  </span>
                </div>
                <div className="col-span-2 hidden sm:block text-[var(--color-muted)] text-xs">
                  {guest.ageRange ?? "—"}
                </div>
                <div className="col-span-4 sm:col-span-3">
                  <StatusBadge status={guest.status} />
                </div>
                <div className="col-span-3 sm:col-span-2 text-right font-mono text-xs text-[var(--color-muted)]">
                  #{guest.bookingId.slice(0, 6).toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-[var(--color-muted)] mt-4 text-center">
        Only name and age range are shown. Phone and email are not exposed.
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar, { type Filters } from "@/components/explore/FilterBar";
import EventGrid from "@/components/events/EventGrid";
import EventGridSkeleton from "@/components/events/EventGridSkeleton";
import type { PublicEvent } from "@/lib/server/types";

const initialFilters: Filters = {
  search: "",
  city: "",
  vibe: "",
  priceMax: "",
  date: "",
};

export default function ExploreClient() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync URL params on mount
  useEffect(() => {
    const city = searchParams.get("city") ?? "";
    const vibe = searchParams.get("vibe") ?? "";
    setFilters((f) => ({ ...f, city, vibe }));
  }, [searchParams]);

  const fetchEvents = useCallback(async (f: Filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (f.search) params.set("search", f.search);
      if (f.city) params.set("city", f.city);
      if (f.vibe) params.set("vibe", f.vibe);
      if (f.priceMax) params.set("maxPrice", f.priceMax);
      if (f.date) params.set("date", f.date);

      const res = await fetch(`/api/events?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load events");
      const json = await res.json();
      setEvents(json.data?.events ?? []);
    } catch {
      setError("Could not load events. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchEvents(filters);
  }, [filters, fetchEvents]);

  return (
    <>
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] mb-2">
          Explore NCR
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-foreground)]">
          Find your next plan
        </h1>
        <p className="mt-2 text-[var(--color-muted)]">
          {loading ? "Loading events..." : `${events.length} event${events.length !== 1 ? "s" : ""} across Delhi NCR`}
        </p>
      </div>

      <div className="mb-8 sticky top-16 z-20 bg-[var(--color-background)]/90 backdrop-blur-md py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-[var(--color-border)]/50">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      {error ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">⚠️</p>
          <p className="text-[var(--color-foreground)] font-semibold">Something went wrong</p>
          <p className="text-[var(--color-muted)] text-sm mt-2">{error}</p>
          <button
            onClick={() => fetchEvents(filters)}
            className="mt-5 text-sm text-[var(--color-primary)] hover:underline font-medium"
          >
            Try again
          </button>
        </div>
      ) : loading ? (
        <EventGridSkeleton count={6} />
      ) : (
        <EventGrid events={events} />
      )}
    </>
  );
}

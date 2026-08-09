"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import FilterBar, { type Filters } from "@/components/explore/FilterBar";
import EventGrid from "@/components/events/EventGrid";
import { EVENTS } from "@/lib/mock-data";

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

  useEffect(() => {
    const city = searchParams.get("city") ?? "";
    const vibe = searchParams.get("vibe") ?? "";
    setFilters((f) => ({ ...f, city, vibe }));
  }, [searchParams]);

  const filtered = useMemo(() => {
    return EVENTS.filter((event) => {
      if (
        filters.search &&
        !event.title.toLowerCase().includes(filters.search.toLowerCase()) &&
        !event.area.toLowerCase().includes(filters.search.toLowerCase()) &&
        !event.city.toLowerCase().includes(filters.search.toLowerCase()) &&
        !event.vibe.join(" ").toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.city && event.city !== filters.city) return false;
      if (filters.vibe && !event.vibe.includes(filters.vibe)) return false;
      if (filters.priceMax && event.price > parseInt(filters.priceMax)) return false;
      if (filters.date && event.dateISO !== filters.date) return false;
      return true;
    });
  }, [filters]);

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
          {filtered.length} event{filtered.length !== 1 ? "s" : ""} across Delhi NCR
        </p>
      </div>

      <div className="mb-8 sticky top-16 z-20 bg-[var(--color-background)]/90 backdrop-blur-md py-3 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-[var(--color-border)]/50">
        <FilterBar filters={filters} onChange={setFilters} />
      </div>

      <EventGrid events={filtered} />
    </>
  );
}

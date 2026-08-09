"use client";

import { Search, SlidersHorizontal } from "lucide-react";
import { CITIES, VIBES } from "@/lib/mock-data";

export type Filters = {
  search: string;
  city: string;
  vibe: string;
  priceMax: string;
  date: string;
};

type FilterBarProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

const PRICE_OPTIONS = [
  { value: "", label: "Any price" },
  { value: "199", label: "Under ₹200" },
  { value: "299", label: "Under ₹300" },
  { value: "499", label: "Under ₹500" },
  { value: "999", label: "Under ₹1000" },
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const update = (key: keyof Filters, value: string) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
        />
        <input
          type="search"
          value={filters.search}
          onChange={(e) => update("search", e.target.value)}
          placeholder="Search events, vibes or areas"
          className="w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl pl-11 pr-4 py-3.5 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-2)] focus:border-[var(--color-primary)] focus:outline-none transition-colors"
        />
      </div>

      {/* Filter chips row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex items-center gap-1.5 shrink-0 text-xs text-[var(--color-muted)] px-1">
          <SlidersHorizontal size={13} />
          <span className="font-medium">Filters</span>
        </div>

        {/* City */}
        <select
          value={filters.city}
          onChange={(e) => update("city", e.target.value)}
          aria-label="Filter by city"
          className="shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-3 py-1.5 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none cursor-pointer appearance-none pr-6 transition-colors hover:border-[var(--color-border-light)]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a8a9a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
        >
          <option value="">All cities</option>
          {CITIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Vibe */}
        <select
          value={filters.vibe}
          onChange={(e) => update("vibe", e.target.value)}
          aria-label="Filter by vibe"
          className="shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-3 py-1.5 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none cursor-pointer appearance-none pr-6 transition-colors hover:border-[var(--color-border-light)]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a8a9a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
        >
          <option value="">Any vibe</option>
          {VIBES.map((v) => (
            <option key={v.value} value={v.label}>{v.emoji} {v.label}</option>
          ))}
        </select>

        {/* Price */}
        <select
          value={filters.priceMax}
          onChange={(e) => update("priceMax", e.target.value)}
          aria-label="Filter by price"
          className="shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-3 py-1.5 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none cursor-pointer appearance-none pr-6 transition-colors hover:border-[var(--color-border-light)]"
          style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%238a8a9a' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center" }}
        >
          {PRICE_OPTIONS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        {/* Date */}
        <input
          type="date"
          value={filters.date}
          onChange={(e) => update("date", e.target.value)}
          aria-label="Filter by date"
          className="shrink-0 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-3 py-1.5 text-xs text-[var(--color-foreground)] focus:border-[var(--color-primary)] focus:outline-none cursor-pointer transition-colors hover:border-[var(--color-border-light)]"
        />

        {/* Clear */}
        {(filters.search || filters.city || filters.vibe || filters.priceMax || filters.date) && (
          <button
            onClick={() => onChange({ search: "", city: "", vibe: "", priceMax: "", date: "" })}
            className="shrink-0 text-xs text-[var(--color-primary)] hover:underline px-2 py-1.5 font-medium"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

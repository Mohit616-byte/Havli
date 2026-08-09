import { Suspense } from "react";
import type { Metadata } from "next";
import ExploreClient from "./ExploreClient";

export const metadata: Metadata = {
  title: "Explore Events — Havli",
  description: "Discover affordable parties, meetups and social experiences across Delhi NCR.",
};

function ExploreFallback() {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] mb-2">
        Explore NCR
      </p>
      <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-foreground)]">
        Find your next plan
      </h1>
      <p className="mt-2 text-[var(--color-muted)]">Loading events...</p>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
      <Suspense fallback={<ExploreFallback />}>
        <ExploreClient />
      </Suspense>
    </div>
  );
}

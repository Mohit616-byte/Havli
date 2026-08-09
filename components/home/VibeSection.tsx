import Link from "next/link";
import { VIBES } from "@/lib/mock-data";
import SectionHeading from "@/components/ui/SectionHeading";

export default function VibeSection() {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <SectionHeading
        eyebrow="Browse by vibe"
        title="What kind of night are you planning?"
        className="mb-10"
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {VIBES.map((vibe) => (
          <Link
            key={vibe.value}
            href={`/explore?vibe=${encodeURIComponent(vibe.label)}`}
            className="group flex flex-col items-center gap-3 p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary-muted)] transition-all duration-200 text-center cursor-pointer"
          >
            <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
              {vibe.emoji}
            </span>
            <span className="text-xs font-semibold text-[var(--color-muted)] group-hover:text-[var(--color-foreground)] transition-colors leading-tight">
              {vibe.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

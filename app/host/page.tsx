import type { Metadata } from "next";
import HostForm from "@/components/host/HostForm";

export const metadata: Metadata = {
  title: "Host an Event — Havli",
  description: "Turn your party, gaming night, meetup or weekend plan into an event people can discover on Havli.",
};

export default function HostPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] mb-4">
            For hosts
          </p>
          <h1 className="text-4xl sm:text-5xl font-black text-[var(--color-foreground)] leading-tight">
            Have a plan?<br />
            <span className="text-[var(--color-primary)]">Host it on Havli.</span>
          </h1>
          <p className="mt-4 text-[var(--color-muted)] text-lg leading-relaxed max-w-md mx-auto">
            Turn your party, gaming night, meetup or weekend plan into an event people can discover.
          </p>
        </div>

        {/* Quick benefits */}
        <div className="grid grid-cols-3 gap-3 mb-12">
          {[
            { emoji: "🎯", label: "Curated crowd" },
            { emoji: "✅", label: "Vetted guests" },
            { emoji: "📣", label: "We promote it" },
          ].map(({ emoji, label }) => (
            <div
              key={label}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 text-center"
            >
              <span className="text-2xl">{emoji}</span>
              <p className="text-xs font-semibold text-[var(--color-muted)] mt-2">{label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 sm:p-8">
          <HostForm />
        </div>
      </div>
    </div>
  );
}

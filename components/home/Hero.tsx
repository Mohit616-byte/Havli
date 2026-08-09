import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Background layers */}
      <div className="absolute inset-0 bg-[var(--color-background)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(255,79,31,0.15),transparent)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_30%_at_80%_80%,rgba(255,179,71,0.06),transparent)]" />

      {/* Grid overlay — subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-foreground) 1px, transparent 1px), linear-gradient(90deg, var(--color-foreground) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-32 flex flex-col items-center text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 bg-[var(--color-primary-muted)] border border-[var(--color-primary)]/20 rounded-full px-4 py-2 mb-8">
          <MapPin size={13} className="text-[var(--color-primary)]" />
          <span className="text-xs font-semibold text-[var(--color-primary)] tracking-wide">
            Delhi NCR &mdash; Gurgaon · Noida · Delhi & more
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[1.05] tracking-tight text-[var(--color-foreground)] max-w-4xl">
          Find your people.{" "}
          <span className="text-[var(--color-primary)]">Find your plans.</span>
        </h1>

        {/* Sub */}
        <p className="mt-6 text-lg sm:text-xl text-[var(--color-muted)] max-w-xl leading-relaxed">
          Discover affordable parties, meetups and social experiences happening around Delhi NCR.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row gap-3 items-center justify-center">
          <Button href="/explore" size="lg">
            Explore events <ArrowRight size={16} />
          </Button>
          <Button href="/host" variant="secondary" size="lg">
            Host an event
          </Button>
        </div>

        {/* Social proof strip */}
        <div className="mt-14 flex flex-wrap justify-center gap-6 text-xs text-[var(--color-muted-2)]">
          {[
            "🏠 House Parties",
            "🎵 Music Nights",
            "🎮 Gaming Meetups",
            "☕ Chill Hangouts",
            "🤝 Meet People",
          ].map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-[var(--color-muted)]">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-[var(--color-muted)] to-transparent" />
        </div>
      </div>
    </section>
  );
}

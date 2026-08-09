import type { Metadata } from "next";
import { Shield, Users, Zap, Heart } from "lucide-react";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "About — Havli",
  description: "Learn about Havli — Delhi NCR's social event discovery platform for affordable parties, meetups and experiences.",
};

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Discover",
    description: "Browse events across Gurgaon, Noida, Delhi and more — filtered by vibe, price, date and area.",
  },
  {
    step: "02",
    title: "Express interest",
    description: "Found something you like? Tell the host you're interested. No payment until the event is confirmed.",
  },
  {
    step: "03",
    title: "Get confirmed",
    description: "The host reviews and confirms. You get the details, the address, and any final instructions.",
  },
  {
    step: "04",
    title: "Show up and vibe",
    description: "Arrive, meet people, and actually enjoy your weekend. Simple as that.",
  },
];

const WHY_HAVLI = [
  { icon: Zap, title: "Affordable", desc: "Most events are under ₹500. No overpriced entry, no fake exclusivity." },
  { icon: Users, title: "Social", desc: "Designed for people who want to meet new people — not just attend events." },
  { icon: Shield, title: "Safe", desc: "Hosts are vetted. Guests are screened. You always know what you're walking into." },
  { icon: Heart, title: "Personal", desc: "Small groups, real connections. Not just another crowded nightclub." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Hero text */}
        <div className="text-center mb-20">
          <p className="text-xs font-semibold tracking-widest uppercase text-[var(--color-primary)] mb-4">
            About Havli
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[var(--color-foreground)] leading-tight">
            Find your people.<br />
            <span className="text-[var(--color-primary)]">Find your plans.</span>
          </h1>
          <p className="mt-6 text-lg text-[var(--color-muted)] max-w-2xl mx-auto leading-relaxed">
            Havli is a social event discovery platform for Delhi NCR. We help people — especially those new to the city — discover affordable social experiences and actually connect with people around them.
          </p>
        </div>

        {/* What is Havli */}
        <section className="mb-20" id="what-is-havli">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 sm:p-10">
            <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-4">
              What is Havli?
            </h2>
            <div className="space-y-4 text-[var(--color-muted)] leading-relaxed">
              <p>
                Havli is where real people host real events — house parties, gaming nights, brunch meetups, karaoke sessions, sports hangouts — and other real people discover and attend them.
              </p>
              <p>
                We are not a dating app. We are not a nightclub listing. We are not a corporate networking platform. We are a social discovery layer for the city, built for people who want to actually do things with other people.
              </p>
              <p>
                If you&apos;re new to Gurgaon, new to Noida, or just tired of spending weekends alone in your flat — Havli is for you.
              </p>
            </div>
          </div>
        </section>

        {/* Why Havli */}
        <section className="mb-20" id="why-havli">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-8">
            Why Havli?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {WHY_HAVLI.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex gap-4"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--color-primary-muted)] flex items-center justify-center">
                  <Icon size={18} className="text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-foreground)] mb-1">{title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-20" id="how-it-works">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-8">
            How it works
          </h2>
          <div className="space-y-4">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.step}
                className="flex gap-5 items-start bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6"
              >
                <div className="shrink-0 w-10 h-10 rounded-full bg-[var(--color-primary-muted)] flex items-center justify-center">
                  <span className="text-xs font-black text-[var(--color-primary)]">{step.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--color-foreground)] mb-1">{step.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Safety */}
        <section className="mb-20" id="safety">
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8 sm:p-10">
            <div className="flex items-center gap-3 mb-4">
              <Shield size={20} className="text-[var(--color-primary)]" />
              <h2 className="text-2xl font-bold text-[var(--color-foreground)]">Safety</h2>
            </div>
            <div className="space-y-3 text-[var(--color-muted)] leading-relaxed">
              <p>
                Safety is built into how Havli works — not bolted on as an afterthought.
              </p>
              <ul className="space-y-2">
                {[
                  "Hosts are reviewed before their events go live.",
                  "Attendees share basic details — so hosts know who's coming.",
                  "Exact addresses are only shared with confirmed guests.",
                  "We review all reported concerns promptly.",
                  "Events are small and intentionally curated.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm">
                    <span className="text-[var(--color-primary)] mt-1 shrink-0">●</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Host CTA */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-[var(--color-foreground)] mb-3">
            Want to host on Havli?
          </h2>
          <p className="text-[var(--color-muted)] mb-6 max-w-sm mx-auto">
            Got a plan? We&apos;ll help you find the right people for it.
          </p>
          <Button href="/host" size="lg">
            Host an event
          </Button>
        </section>

      </div>
    </div>
  );
}

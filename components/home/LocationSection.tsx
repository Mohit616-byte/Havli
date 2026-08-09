import Image from "next/image";
import Link from "next/link";
import { CITIES, LOCATION_IMAGES } from "@/lib/mock-data";
import SectionHeading from "@/components/ui/SectionHeading";

const CITY_EVENTS: Record<string, number> = {
  Gurgaon: 24,
  Noida: 18,
  Delhi: 31,
  "Greater Noida": 9,
  Ghaziabad: 7,
  Faridabad: 5,
};

export default function LocationSection() {
  return (
    <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <SectionHeading
        eyebrow="Explore NCR"
        title="What's happening around you?"
        subtitle="Pick your city and discover events made for people like you."
        className="mb-10"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {CITIES.map((city) => (
          <Link
            key={city}
            href={`/explore?city=${encodeURIComponent(city)}`}
            className="group relative rounded-2xl overflow-hidden aspect-[4/5] sm:aspect-square bg-[var(--color-surface-2)] block"
          >
            <Image
              src={LOCATION_IMAGES[city]}
              alt={`Events in ${city}`}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 17vw"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-0 bg-[var(--color-primary)]/0 group-hover:bg-[var(--color-primary)]/10 transition-colors duration-300" />

            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white font-semibold text-sm leading-tight">{city}</p>
              <p className="text-white/60 text-[11px] mt-0.5">{CITY_EVENTS[city]} events</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

import Hero from "@/components/home/Hero";
import LocationSection from "@/components/home/LocationSection";
import VibeSection from "@/components/home/VibeSection";
import FeaturedEvents from "@/components/home/FeaturedEvents";

export default function HomePage() {
  return (
    <>
      <Hero />
      <LocationSection />
      <VibeSection />
      <FeaturedEvents />
    </>
  );
}

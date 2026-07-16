import { AboutSection } from "@/components/sections/about-section";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { Testimonials } from "@/components/sections/testimonials";
import { Eyebrow } from "@/components/ui/typography";

export const metadata = {
  title: "About Us | R&G Scents",
  description: "The story, philosophy, and craftsmanship behind R&G Scents and The Billionaire Collection.",
};

export default function AboutPage() {
  return (
    <div>
      <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6">
        <Eyebrow>Our Story</Eyebrow>
        <h1 className="mt-4 text-balance font-serif text-4xl font-semibold text-fg sm:text-5xl">
          Luxury is not worn. It is remembered.
        </h1>
        <p className="mt-6 text-base leading-relaxed text-overlay/60 sm:text-lg">
          R&amp;G Scents was founded to prove that a new fragrance house could stand shoulder to
          shoulder with Creed, Tom Ford, and Roja Parfums — not by imitation, but by obsession over
          craft. The Billionaire Collection is our answer: five fragrances built for men who don't
          chase legacy. They create it.
        </p>
      </div>
      <AboutSection />
      <WhyChooseUs />
      <Testimonials />
    </div>
  );
}

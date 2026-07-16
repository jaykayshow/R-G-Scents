import { Hero } from "@/components/sections/hero";
import { FeaturedCollection } from "@/components/sections/featured-collection";
import { AboutSection } from "@/components/sections/about-section";
import { WhyChooseUs } from "@/components/sections/why-choose-us";
import { BestSellers } from "@/components/sections/best-sellers";
import { Testimonials } from "@/components/sections/testimonials";
import { InstagramGallery } from "@/components/sections/instagram-gallery";
import { NewsletterSection } from "@/components/sections/newsletter-section";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedCollection />
      <AboutSection />
      <WhyChooseUs />
      <BestSellers />
      <Testimonials />
      <InstagramGallery />
      <NewsletterSection />
    </>
  );
}

import { Clock, Droplet, Package, Truck, Globe2, Sparkles, ShieldCheck, Gem } from "lucide-react";
import { SectionHeading } from "@/components/ui/typography";

const features = [
  { icon: Clock, title: "Long-Lasting Fragrance", description: "Formulated for 8-14+ hours of wear." },
  { icon: Droplet, title: "Premium Oils", description: "Rare, high-concentration ingredients sourced globally." },
  { icon: Package, title: "Luxury Packaging", description: "Heirloom-grade boxes and bottles, hand-finished." },
  { icon: Truck, title: "Fast Delivery", description: "2-4 day delivery across Nigeria." },
  { icon: Globe2, title: "Worldwide Shipping", description: "Shipped internationally, wherever you are." },
  { icon: Sparkles, title: "Exclusive Scents", description: "Compositions you won't find anywhere else." },
  { icon: Gem, title: "Limited Editions", description: "Rare drops for the true collector." },
  { icon: ShieldCheck, title: "Secure Payments", description: "PCI-DSS compliant checkout, every time." },
];

export function WhyChooseUs() {
  return (
    <section className="bg-matte-black py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Why Choose Us" title="Details Only a Billionaire Would Notice" />
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-4">
          {features.map((feature) => (
            <div key={feature.title} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/30 text-gold">
                <feature.icon size={22} />
              </div>
              <h3 className="font-serif text-sm text-brand-white sm:text-base">{feature.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-white/50">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

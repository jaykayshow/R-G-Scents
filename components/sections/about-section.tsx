import Image from "next/image";
import { Eyebrow } from "@/components/ui/typography";

export function AboutSection() {
  return (
    <section className="bg-surface py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative order-2 aspect-[4/5] overflow-hidden rounded-md bg-bg lg:order-1">
          <Image src="/products/legacy.png" alt="R&G Scents craftsmanship" fill className="object-contain p-12" />
        </div>
        <div className="order-1 lg:order-2">
          <Eyebrow>About R&amp;G Scents</Eyebrow>
          <h2 className="mt-3 text-balance font-serif text-3xl font-semibold text-fg sm:text-4xl">
            Built for men who don&apos;t follow legacy. They create it.
          </h2>
          <p className="mt-6 text-sm leading-relaxed text-overlay/60 sm:text-base">
            R&amp;G Scents was founded on a singular belief: that true luxury cannot be manufactured
            at scale — it must be crafted, deliberated over, and earned. The Billionaire Collection is
            the result of years spent sourcing rare oud, aged amber, and precious florals from the
            same houses that supply the world&apos;s most storied perfumers.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-overlay/60 sm:text-base">
            Every bottle is finished by hand. Every box is engineered to feel like an heirloom the
            moment it&apos;s opened. This is not fragrance as an accessory — it&apos;s fragrance as a
            signature.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3">
            {[
              { label: "Founded", value: "2024" },
              { label: "Fragrances", value: "5+" },
              { label: "Countries Shipped", value: "12+" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-serif text-3xl text-gold">{stat.value}</p>
                <p className="mt-1 text-xs uppercase tracking-widest text-overlay/50">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

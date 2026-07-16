import { Quote } from "lucide-react";
import { testimonials } from "@/lib/mock-data/misc";
import { SectionHeading } from "@/components/ui/typography";
import { StarRating } from "@/components/ui/star-rating";
import { Card } from "@/components/ui/card";

export function Testimonials() {
  return (
    <section className="bg-bg py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="What They're Saying" title="Trusted by Men Who Notice Details" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <Card key={t.id} className="p-6">
              <Quote className="mb-4 text-gold/50" size={28} />
              <StarRating rating={t.rating} className="mb-4" />
              <p className="text-sm leading-relaxed text-overlay/70">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-6 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 font-serif text-sm text-gold">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-fg">{t.name}</p>
                  <p className="text-xs text-overlay/40">{t.location}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

import { Eyebrow } from "@/components/ui/typography";

export const metadata = { title: "Terms of Service | R&G Scents" };

const sections = [
  {
    title: "Acceptance of Terms",
    body: "By accessing or using the R&G Scents website, you agree to be bound by these Terms of Service and our Privacy Policy.",
  },
  {
    title: "Orders & Payment",
    body: "All orders are subject to product availability. Prices are listed in USD/NGN and may be updated without notice. Payment is processed at the time of order via your selected gateway.",
  },
  {
    title: "Shipping & Returns",
    body: "Shipping timelines vary by destination. Unopened, unused products may be returned within 14 days of delivery. Contact support to initiate a return or exchange.",
  },
  {
    title: "Intellectual Property",
    body: "All content on this site — including product names, imagery, and The Billionaire Collection branding — is the property of R&G Scents and may not be reproduced without permission.",
  },
  {
    title: "Limitation of Liability",
    body: "R&G Scents is not liable for indirect or consequential damages arising from use of this website or its products, to the fullest extent permitted by law.",
  },
];

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <Eyebrow>Legal</Eyebrow>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-brand-white">Terms of Service</h1>
      <p className="mt-3 text-xs text-white/40">Last updated: July 15, 2026</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-serif text-xl text-brand-white">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

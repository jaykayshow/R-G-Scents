import { Eyebrow } from "@/components/ui/typography";

export const metadata = { title: "Privacy Policy | R&G Scents" };

const sections = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly (name, email, shipping address, payment tokens) and information collected automatically (device, browser, and usage data) to operate and improve the R&G Scents storefront.",
  },
  {
    title: "How We Use Your Information",
    body: "Your information is used to process orders, provide customer support, personalize product recommendations, send transactional and marketing emails (with consent), and prevent fraud.",
  },
  {
    title: "Payment Data",
    body: "R&G Scents never stores raw card numbers. All payment processing is handled by PCI-DSS compliant gateways including Stripe, Paystack, and Flutterwave.",
  },
  {
    title: "Your Rights Under NDPA",
    body: "In accordance with the Nigeria Data Protection Act (NDPA), you may request access to, correction of, or deletion of your personal data at any time via your Account Settings or by contacting support@rgscents.com.",
  },
  {
    title: "Cookies",
    body: "We use cookies to maintain your session, remember cart contents, and analyze site performance. You can control cookie preferences via your browser settings.",
  },
];

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <Eyebrow>Legal</Eyebrow>
      <h1 className="mt-3 font-serif text-4xl font-semibold text-fg">Privacy Policy</h1>
      <p className="mt-3 text-xs text-overlay/40">Last updated: July 15, 2026</p>
      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="font-serif text-xl text-fg">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-overlay/60">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { Camera, ThumbsUp, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToastStore } from "@/lib/store/toast-store";

const columns = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All Fragrances" },
      { href: "/shop?collection=legacy", label: "Legacy" },
      { href: "/shop?collection=noir", label: "Noir" },
      { href: "/shop?collection=royale", label: "Royale" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/blog", label: "Journal" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "/contact", label: "FAQ" },
      { href: "/account/orders", label: "Track Order" },
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const showToast = useToastStore((s) => s.show);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast("Please enter a valid email address.", "error");
      return;
    }
    setSubmitted(true);
    showToast("Welcome to the Billionaire Insider circle.");
    setEmail("");
  }

  return (
    <footer className="border-t border-overlay/10 bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-serif text-2xl font-bold text-fg">
              R&amp;G <span className="text-gold">SCENTS</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-overlay/50">
              Luxury is not worn. It is remembered. Discover The Billionaire Collection —
              timeless fragrances crafted for men who leave a legacy.
            </p>
            <div className="mt-6 flex gap-4">
              {[
                { Icon: Camera, name: "Instagram" },
                { Icon: ThumbsUp, name: "Facebook" },
                { Icon: MessageCircle, name: "Twitter" },
              ].map(({ Icon, name }) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => showToast(`${name} page coming soon.`, "info")}
                  aria-label={name}
                  className="rounded-full border border-overlay/15 p-2.5 text-overlay/60 transition-colors hover:border-gold hover:text-gold"
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-overlay/60 hover:text-fg">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t border-overlay/10 pt-10">
          <h4 className="font-serif text-lg text-fg">Become a Billionaire Insider</h4>
          <p className="mt-2 max-w-md text-sm text-overlay/50">
            Exclusive launches, private discounts, and early access — delivered straight to your inbox.
          </p>
          {submitted ? (
            <p className="mt-4 text-sm text-gold">Thank you — check your inbox to confirm your subscription.</p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 flex max-w-md gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                className="w-full rounded-sm border border-overlay/15 bg-overlay/[0.03] px-4 py-2.5 text-sm text-fg placeholder:text-overlay/35 focus:border-gold focus:outline-none"
              />
              <Button type="submit" size="sm">
                <Send size={14} />
              </Button>
            </form>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-overlay/10 pt-8 text-xs text-overlay/40 sm:flex-row">
          <p>&copy; {new Date().getFullYear()} R&amp;G Scents. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gold">Privacy</Link>
            <Link href="/terms" className="hover:text-gold">Terms</Link>
            <Link href="/contact" className="hover:text-gold">FAQ</Link>
            <Link href="/contact" className="hover:text-gold">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

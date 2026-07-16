"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { useState } from "react";
import { useBannersStore } from "@/lib/store/banners-store";

export function PromoBanner() {
  const banner = useBannersStore((s) => s.banners.find((b) => b.active && b.placement === "homepage-top"));
  const [dismissed, setDismissed] = useState(false);

  if (!banner || dismissed) return null;

  return (
    <div className="relative flex items-center justify-center gap-3 bg-gold px-4 py-2.5 text-center text-xs font-medium text-ink sm:text-sm">
      <p>
        <span className="font-semibold">{banner.title}</span>
        {banner.subtitle && <span className="hidden sm:inline"> — {banner.subtitle}</span>}
        {banner.ctaLabel && banner.ctaHref && (
          <Link href={banner.ctaHref} className="ml-2 underline underline-offset-2 hover:no-underline">
            {banner.ctaLabel}
          </Link>
        )}
      </p>
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss banner"
        className="absolute right-3 text-ink/70 hover:text-ink"
      >
        <X size={14} />
      </button>
    </div>
  );
}

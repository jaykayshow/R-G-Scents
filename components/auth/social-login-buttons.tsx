"use client";

import { Apple } from "lucide-react";
import { useToastStore } from "@/lib/store/toast-store";

export function SocialLoginButtons() {
  const showToast = useToastStore((s) => s.show);

  function handleClick(provider: string) {
    showToast(`${provider} sign-in is not connected in this preview.`, "info");
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      <button
        type="button"
        onClick={() => handleClick("Google")}
        aria-label="Continue with Google"
        className="flex items-center justify-center gap-2 rounded-sm border border-overlay/15 py-3 text-sm font-semibold text-overlay/80 transition-colors hover:border-gold hover:text-gold"
      >
        <span className="font-serif text-base">G</span>
      </button>
      <button
        type="button"
        onClick={() => handleClick("Apple")}
        aria-label="Continue with Apple"
        className="flex items-center justify-center gap-2 rounded-sm border border-overlay/15 py-3 text-sm font-semibold text-overlay/80 transition-colors hover:border-gold hover:text-gold"
      >
        <Apple size={17} />
      </button>
      <button
        type="button"
        onClick={() => handleClick("Facebook")}
        aria-label="Continue with Facebook"
        className="flex items-center justify-center gap-2 rounded-sm border border-overlay/15 py-3 text-sm font-semibold text-overlay/80 transition-colors hover:border-gold hover:text-gold"
      >
        <span className="font-serif text-base">f</span>
      </button>
    </div>
  );
}

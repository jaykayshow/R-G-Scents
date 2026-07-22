"use client";

import { useEffect } from "react";
import { useCurrencyStore } from "@/lib/store/currency-store";

/**
 * Detects the visitor's likely currency from their browser locale and fetches
 * NGN exchange rates, so storefront prices can show a converted estimate
 * alongside the real Naira price. NGN is always the authoritative amount.
 */
export function CurrencyHydration() {
  const init = useCurrencyStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return null;
}

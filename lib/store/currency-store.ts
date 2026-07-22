import { create } from "zustand";

const RATES_CACHE_KEY = "rg-scents-fx-rates";
const RATES_CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12h — free tier updates once/day anyway

// Common storefront markets. Unmapped regions simply don't get a converted
// estimate — NGN is always the real, authoritative price regardless.
const REGION_TO_CURRENCY: Record<string, string> = {
  US: "USD",
  GB: "GBP",
  CA: "CAD",
  AU: "AUD",
  NZ: "NZD",
  CH: "CHF",
  JP: "JPY",
  CN: "CNY",
  IN: "INR",
  ZA: "ZAR",
  KE: "KES",
  GH: "GHS",
  AE: "AED",
  SA: "SAR",
  BR: "BRL",
  MX: "MXN",
  SG: "SGD",
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  IE: "EUR",
  PT: "EUR",
  FI: "EUR",
  GR: "EUR",
  LU: "EUR",
  SI: "EUR",
  SK: "EUR",
  EE: "EUR",
  LV: "EUR",
  LT: "EUR",
  CY: "EUR",
  MT: "EUR",
  HR: "EUR",
};

function detectRegion(): string | null {
  if (typeof navigator === "undefined") return null;
  try {
    const locale = navigator.language || navigator.languages?.[0];
    if (!locale) return null;
    // Intl.Locale gives a reliable region subtag (e.g. "US" from "en-US")
    const region = new Intl.Locale(locale).maximize().region;
    return region ?? null;
  } catch {
    // Fallback for older engines without Intl.Locale support
    const parts = navigator.language?.split("-");
    return parts && parts.length > 1 ? parts[1].toUpperCase() : null;
  }
}

interface RatesCache {
  fetchedAt: number;
  rates: Record<string, number>;
}

async function fetchRates(): Promise<Record<string, number> | null> {
  if (typeof window === "undefined") return null;
  try {
    const cachedRaw = localStorage.getItem(RATES_CACHE_KEY);
    if (cachedRaw) {
      const cached: RatesCache = JSON.parse(cachedRaw);
      if (Date.now() - cached.fetchedAt < RATES_CACHE_TTL_MS) {
        return cached.rates;
      }
    }
  } catch {
    // corrupted cache — ignore and refetch
  }

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/NGN");
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.result !== "success" || !data.rates) return null;
    localStorage.setItem(RATES_CACHE_KEY, JSON.stringify({ fetchedAt: Date.now(), rates: data.rates }));
    return data.rates;
  } catch {
    return null;
  }
}

interface CurrencyState {
  detectedCurrency: string | null;
  rates: Record<string, number> | null;
  ready: boolean;
  init: () => Promise<void>;
  convert: (ngnAmount: number) => number | null;
}

export const useCurrencyStore = create<CurrencyState>()((set, get) => ({
  detectedCurrency: null,
  rates: null,
  ready: false,

  init: async () => {
    const region = detectRegion();
    const currency = region ? REGION_TO_CURRENCY[region] : undefined;

    // Nigerian visitors (or undetectable/unmapped regions) see NGN only.
    if (!currency) {
      set({ ready: true });
      return;
    }

    const rates = await fetchRates();
    set({ detectedCurrency: currency, rates, ready: true });
  },

  convert: (ngnAmount: number) => {
    const { detectedCurrency, rates } = get();
    if (!detectedCurrency || !rates?.[detectedCurrency]) return null;
    return ngnAmount * rates[detectedCurrency];
  },
}));

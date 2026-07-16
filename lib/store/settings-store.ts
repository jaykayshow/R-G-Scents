import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SiteSettings } from "@/types";

const defaultSettings: SiteSettings = {
  siteName: "R&G Scents",
  supportEmail: "concierge@rgscents.com",
  supportPhone: "+234 803 000 1122",
  maintenanceMode: false,
  taxRatePercent: 5,
  flatShippingRate: 15,
  freeShippingThreshold: 200,
  codEnabled: true,
  bankTransferEnabled: true,
  stripeEnabled: true,
  paystackEnabled: true,
  flutterwaveEnabled: true,
  paypalEnabled: true,
  metaTitle: "R&G Scents | The Billionaire Collection",
  metaDescription:
    "Luxury is not worn. It is remembered. Discover The Billionaire Collection by R&G Scents — timeless fragrances crafted for men who leave a legacy.",
};

interface SettingsState {
  settings: SiteSettings;
  updateSettings: (patch: Partial<SiteSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: defaultSettings,
      updateSettings: (patch) => set((state) => ({ settings: { ...state.settings, ...patch } })),
    }),
    { name: "rg-scents-settings" }
  )
);

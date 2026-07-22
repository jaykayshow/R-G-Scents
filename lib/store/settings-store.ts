import { create } from "zustand";
import { SiteSettings } from "@/types";
import { apiClient } from "@/lib/api-client";

const defaultSettings: SiteSettings = {
  siteName: "R&G Scents",
  supportEmail: "concierge@rgscents.com",
  supportPhone: "+234 803 000 1122",
  maintenanceMode: false,
  taxRatePercent: 5,
  flatShippingRate: 22500,
  freeShippingThreshold: 300000,
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
  loading: boolean;
  fetchSettings: () => Promise<void>;
  updateSettings: (patch: Partial<SiteSettings>, section: string) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  settings: defaultSettings,
  loading: false,

  fetchSettings: async () => {
    set({ loading: true });
    try {
      const settings = await apiClient.settings.get();
      set({ settings, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  updateSettings: async (patch, section) => {
    const settings = await apiClient.adminSettings.update(patch, section);
    set({ settings });
  },
}));

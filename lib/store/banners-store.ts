import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Banner } from "@/types";
import { banners as seedBanners } from "@/lib/mock-data/banners";

interface BannersState {
  banners: Banner[];
  addBanner: (banner: Banner) => void;
  updateBanner: (id: string, patch: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
  toggleActive: (id: string) => void;
}

export const useBannersStore = create<BannersState>()(
  persist(
    (set) => ({
      banners: seedBanners,
      addBanner: (banner) => set((state) => ({ banners: [banner, ...state.banners] })),
      updateBanner: (id, patch) =>
        set((state) => ({ banners: state.banners.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      deleteBanner: (id) => set((state) => ({ banners: state.banners.filter((b) => b.id !== id) })),
      toggleActive: (id) =>
        set((state) => ({ banners: state.banners.map((b) => (b.id === id ? { ...b, active: !b.active } : b)) })),
    }),
    { name: "rg-scents-banners" }
  )
);

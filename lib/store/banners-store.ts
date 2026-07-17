import { create } from "zustand";
import { Banner } from "@/types";
import { apiClient } from "@/lib/api-client";

interface BannersState {
  banners: Banner[];
  loading: boolean;
  fetchBanners: () => Promise<void>;
  addBanner: (banner: Banner) => Promise<void>;
  updateBanner: (id: string, patch: Partial<Banner>) => Promise<void>;
  deleteBanner: (id: string) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

export const useBannersStore = create<BannersState>()((set) => ({
  banners: [],
  loading: false,

  fetchBanners: async () => {
    set({ loading: true });
    try {
      const banners = await apiClient.banners.list();
      set({ banners, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  addBanner: async (banner) => {
    const created = await apiClient.adminBanners.create(banner);
    set((state) => ({ banners: [created, ...state.banners] }));
  },

  updateBanner: async (id, patch) => {
    const updated = await apiClient.adminBanners.update(id, patch);
    set((state) => ({ banners: state.banners.map((b) => (b.id === id ? updated : b)) }));
  },

  deleteBanner: async (id) => {
    await apiClient.adminBanners.delete(id);
    set((state) => ({ banners: state.banners.filter((b) => b.id !== id) }));
  },

  toggleActive: async (id) => {
    const updated = await apiClient.adminBanners.toggleActive(id);
    set((state) => ({ banners: state.banners.map((b) => (b.id === id ? updated : b)) }));
  },
}));

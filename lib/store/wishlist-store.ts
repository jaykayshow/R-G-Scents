import { create } from "zustand";
import { apiClient } from "@/lib/api-client";

interface WishlistState {
  productIds: string[];
  loading: boolean;
  fetchWishlist: () => Promise<void>;
  toggle: (productId: string) => Promise<void>;
  has: (productId: string) => boolean;
  remove: (productId: string) => Promise<void>;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  productIds: [],
  loading: false,

  fetchWishlist: async () => {
    set({ loading: true });
    try {
      const productIds = await apiClient.wishlist.list();
      set({ productIds, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  toggle: async (productId) => {
    const has = get().productIds.includes(productId);
    const productIds = has ? await apiClient.wishlist.remove(productId) : await apiClient.wishlist.add(productId);
    set({ productIds });
  },

  has: (productId) => get().productIds.includes(productId),

  remove: async (productId) => {
    const productIds = await apiClient.wishlist.remove(productId);
    set({ productIds });
  },

  clear: () => set({ productIds: [] }),
}));

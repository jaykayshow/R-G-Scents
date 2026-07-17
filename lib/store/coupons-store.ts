import { create } from "zustand";
import { Coupon } from "@/types";
import { apiClient } from "@/lib/api-client";

interface CouponsState {
  coupons: Coupon[];
  loading: boolean;
  error: string | null;
  fetchCoupons: () => Promise<void>;
  addCoupon: (coupon: Coupon) => Promise<void>;
  updateCoupon: (code: string, patch: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  validate: (code: string, subtotal: number) => Promise<{ valid: boolean; coupon?: Coupon; message: string }>;
}

export const useCouponsStore = create<CouponsState>()((set) => ({
  coupons: [],
  loading: false,
  error: null,

  fetchCoupons: async () => {
    set({ loading: true, error: null });
    try {
      const coupons = await apiClient.adminCoupons.list();
      set({ coupons, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load coupons.", loading: false });
    }
  },

  addCoupon: async (coupon) => {
    const created = await apiClient.adminCoupons.create(coupon);
    set((state) => ({ coupons: [created, ...state.coupons] }));
  },

  updateCoupon: async (code, patch) => {
    const updated = await apiClient.adminCoupons.update(code, patch);
    set((state) => ({ coupons: state.coupons.map((c) => (c.code === code ? updated : c)) }));
  },

  deleteCoupon: async (code) => {
    await apiClient.adminCoupons.delete(code);
    set((state) => ({ coupons: state.coupons.filter((c) => c.code !== code) }));
  },

  validate: async (code, subtotal) => apiClient.coupons.validate(code, subtotal),
}));

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Coupon } from "@/types";
import { coupons as seedCoupons, validateCouponAgainst } from "@/lib/mock-data/coupons";

interface CouponsState {
  coupons: Coupon[];
  addCoupon: (coupon: Coupon) => void;
  updateCoupon: (code: string, patch: Partial<Coupon>) => void;
  deleteCoupon: (code: string) => void;
  incrementUsage: (code: string) => void;
  validate: (code: string, subtotal: number) => { valid: boolean; coupon?: Coupon; message: string };
}

export const useCouponsStore = create<CouponsState>()(
  persist(
    (set, get) => ({
      coupons: seedCoupons,
      addCoupon: (coupon) => set((state) => ({ coupons: [coupon, ...state.coupons] })),
      updateCoupon: (code, patch) =>
        set((state) => ({
          coupons: state.coupons.map((c) => (c.code === code ? { ...c, ...patch } : c)),
        })),
      deleteCoupon: (code) => set((state) => ({ coupons: state.coupons.filter((c) => c.code !== code) })),
      incrementUsage: (code) =>
        set((state) => ({
          coupons: state.coupons.map((c) => (c.code === code ? { ...c, usageCount: c.usageCount + 1 } : c)),
        })),
      validate: (code, subtotal) => validateCouponAgainst(get().coupons, code, subtotal),
    }),
    { name: "rg-scents-coupons" }
  )
);

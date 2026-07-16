import { Coupon } from "@/types";
import { calculateDiscount } from "@/lib/mock-data/coupons";
import { useSettingsStore } from "@/lib/store/settings-store";

export function computeOrderTotals(subtotal: number, coupon: Coupon | null) {
  const { flatShippingRate, freeShippingThreshold, taxRatePercent } = useSettingsStore.getState().settings;
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : flatShippingRate;
  const discount = coupon ? calculateDiscount(coupon, subtotal, shipping) : 0;
  const tax = Math.round((subtotal - discount) * (taxRatePercent / 100) * 100) / 100;
  const total = Math.max(0, subtotal - discount + shipping + tax);
  return { subtotal, shipping, discount, tax, total };
}

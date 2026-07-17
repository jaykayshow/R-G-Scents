import { Coupon } from "@/types";

export function calculateDiscount(coupon: Coupon, subtotal: number, shipping: number): number {
  if (coupon.type === "percentage") return Math.round(subtotal * (coupon.value / 100) * 100) / 100;
  if (coupon.type === "fixed") return Math.min(coupon.value, subtotal);
  if (coupon.type === "free-shipping") return shipping;
  return 0;
}

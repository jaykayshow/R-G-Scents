import { Coupon } from "@/types";
import { calculateDiscount } from "@/lib/mock-data/coupons";

const FREE_SHIPPING_THRESHOLD = 200;
const FLAT_SHIPPING = 15;
const TAX_RATE = 0.05;

export function computeOrderTotals(subtotal: number, coupon: Coupon | null) {
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
  const discount = coupon ? calculateDiscount(coupon, subtotal, shipping) : 0;
  const tax = Math.round((subtotal - discount) * TAX_RATE * 100) / 100;
  const total = Math.max(0, subtotal - discount + shipping + tax);
  return { subtotal, shipping, discount, tax, total };
}

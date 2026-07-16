import { Coupon } from "@/types";

export const coupons: Coupon[] = [
  {
    code: "BILLIONAIRE10",
    type: "percentage",
    value: 10,
    description: "10% off your order",
    active: true,
    usageCount: 142,
    usageLimit: undefined,
  },
  {
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    description: "20% off your first order",
    minSubtotal: 100,
    active: true,
    usageCount: 89,
    usageLimit: 500,
  },
  {
    code: "FREESHIP",
    type: "free-shipping",
    value: 0,
    description: "Free shipping on this order",
    active: true,
    usageCount: 211,
  },
  {
    code: "LEGACY50",
    type: "fixed",
    value: 50,
    description: "$50 off orders over $250",
    minSubtotal: 250,
    active: true,
    usageCount: 34,
    usageLimit: 100,
  },
  {
    code: "SUMMER25",
    type: "percentage",
    value: 25,
    description: "Summer promo — expired",
    active: false,
    usageCount: 78,
    expiresAt: "2026-06-30",
  },
];

export function calculateDiscount(coupon: Coupon, subtotal: number, shipping: number): number {
  if (coupon.type === "percentage") return Math.round(subtotal * (coupon.value / 100) * 100) / 100;
  if (coupon.type === "fixed") return Math.min(coupon.value, subtotal);
  if (coupon.type === "free-shipping") return shipping;
  return 0;
}

export function validateCouponAgainst(
  list: Coupon[],
  code: string,
  subtotal: number
): { valid: boolean; coupon?: Coupon; message: string } {
  const coupon = list.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!coupon) {
    return { valid: false, message: "This coupon code is not valid." };
  }
  if (!coupon.active) {
    return { valid: false, message: "This coupon is no longer active." };
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, message: "This coupon has reached its usage limit." };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { valid: false, message: "This coupon has expired." };
  }
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      message: `Add $${(coupon.minSubtotal - subtotal).toFixed(2)} more to use this code.`,
    };
  }
  return { valid: true, coupon, message: `"${coupon.code}" applied — ${coupon.description}.` };
}

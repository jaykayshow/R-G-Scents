import { Coupon } from "@/types";

export const coupons: Coupon[] = [
  {
    code: "BILLIONAIRE10",
    type: "percentage",
    value: 10,
    description: "10% off your order",
  },
  {
    code: "WELCOME20",
    type: "percentage",
    value: 20,
    description: "20% off your first order",
    minSubtotal: 100,
  },
  {
    code: "FREESHIP",
    type: "free-shipping",
    value: 0,
    description: "Free shipping on this order",
  },
  {
    code: "LEGACY50",
    type: "fixed",
    value: 50,
    description: "$50 off orders over $250",
    minSubtotal: 250,
  },
];

export function validateCoupon(
  code: string,
  subtotal: number
): { valid: boolean; coupon?: Coupon; message: string } {
  const coupon = coupons.find((c) => c.code.toLowerCase() === code.trim().toLowerCase());
  if (!coupon) {
    return { valid: false, message: "This coupon code is not valid." };
  }
  if (coupon.minSubtotal && subtotal < coupon.minSubtotal) {
    return {
      valid: false,
      message: `Add $${(coupon.minSubtotal - subtotal).toFixed(2)} more to use this code.`,
    };
  }
  return { valid: true, coupon, message: `"${coupon.code}" applied — ${coupon.description}.` };
}

export function calculateDiscount(coupon: Coupon, subtotal: number, shipping: number): number {
  if (coupon.type === "percentage") return Math.round(subtotal * (coupon.value / 100) * 100) / 100;
  if (coupon.type === "fixed") return Math.min(coupon.value, subtotal);
  if (coupon.type === "free-shipping") return shipping;
  return 0;
}

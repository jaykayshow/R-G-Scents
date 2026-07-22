"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ShoppingBag, Tag, X } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { QuantityInput } from "@/components/ui/quantity-input";
import { useCartStore } from "@/lib/store/cart-store";
import { useToastStore } from "@/lib/store/toast-store";
import { useCouponsStore } from "@/lib/store/coupons-store";
import { computeOrderTotals } from "@/lib/order-totals";
import { formatCurrency } from "@/lib/utils";
import { Price } from "@/components/ui/price";

export default function CartPage() {
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const showToast = useToastStore((s) => s.show);
  const validateCouponCode = useCouponsStore((s) => s.validate);

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");

  useEffect(() => setHydrated(true), []);

  const totals = computeOrderTotals(subtotal, appliedCoupon);

  async function handleApplyCoupon(e: React.FormEvent) {
    e.preventDefault();
    const result = await validateCouponCode(couponInput, subtotal);
    if (!result.valid || !result.coupon) {
      setCouponError(result.message);
      return;
    }
    applyCoupon(result.coupon);
    setCouponError("");
    setCouponInput("");
    showToast(result.message);
  }

  function handleCheckout() {
    const outOfStock = items.find((i) => i.quantity > i.stock);
    if (outOfStock) {
      showToast(`${outOfStock.name} only has ${outOfStock.stock} unit(s) left in stock.`, "error");
      return;
    }
    router.push("/checkout");
  }

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-32 text-center">
        <ShoppingBag size={40} className="text-overlay/20" />
        <h1 className="font-serif text-3xl text-fg">Your Bag is Empty</h1>
        <p className="text-sm text-overlay/50">Discover fragrances built for men who leave a legacy.</p>
        <ButtonLink href="/shop">Shop the Collection</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-10 font-serif text-3xl font-semibold text-fg sm:text-4xl">Your Bag</h1>

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-5 border-b border-overlay/10 pb-6">
              <Link href={`/shop/${item.slug}`} className="relative h-28 w-24 shrink-0 overflow-hidden rounded-sm bg-overlay/5">
                <Image src={item.image} alt={item.name} fill className="object-contain p-3" />
              </Link>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link href={`/shop/${item.slug}`} className="font-serif text-lg text-fg hover:text-gold">
                      {item.name}
                    </Link>
                    <p className="text-xs text-overlay/40">{item.size}</p>
                    {item.quantity > item.stock && (
                      <p className="mt-1 text-xs text-red-400">Only {item.stock} left in stock</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeItem(item.variantId)}
                    aria-label="Remove item"
                    className="text-overlay/40 hover:text-red-300"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <QuantityInput
                    quantity={item.quantity}
                    onChange={(q) => updateQuantity(item.variantId, q)}
                    max={item.stock}
                  />
                  <Price amount={item.price * item.quantity} className="font-serif text-lg text-fg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit rounded-md border border-overlay/10 bg-overlay/[0.03] p-6">
          <h2 className="mb-6 font-serif text-xl text-fg">Order Summary</h2>

          {appliedCoupon ? (
            <div className="mb-4 flex items-center justify-between rounded-sm border border-gold/30 bg-gold/5 px-3 py-2 text-xs">
              <span className="flex items-center gap-2 text-gold">
                <Tag size={13} /> {appliedCoupon.code}
              </span>
              <button onClick={removeCoupon} aria-label="Remove coupon">
                <X size={14} className="text-overlay/50 hover:text-red-300" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleApplyCoupon} className="mb-4">
              <div className="flex gap-2">
                <input
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Coupon code"
                  className="w-full rounded-sm border border-overlay/15 bg-overlay/[0.03] px-3 py-2 text-sm text-fg placeholder:text-overlay/35 focus:border-gold focus:outline-none"
                />
                <Button type="submit" size="sm" variant="secondary" className="shrink-0">
                  Apply
                </Button>
              </div>
              {couponError && <p className="mt-1.5 text-xs text-red-400">{couponError}</p>}
              <p className="mt-1.5 text-[11px] text-overlay/30">Try WELCOME20, BILLIONAIRE10, FREESHIP, or LEGACY50</p>
            </form>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-overlay/60"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
            <div className="flex justify-between text-overlay/60"><span>Shipping</span><span>{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</span></div>
            <div className="flex justify-between text-overlay/60"><span>Tax</span><span>{formatCurrency(totals.tax)}</span></div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-gold"><span>Discount</span><span>-{formatCurrency(totals.discount)}</span></div>
            )}
          </div>
          <div className="mt-4 flex justify-between border-t border-overlay/10 pt-4 font-serif text-xl text-fg">
            <span>Total</span><Price amount={totals.total} />
          </div>

          <Button onClick={handleCheckout} size="lg" className="mt-6 w-full">
            Proceed to Checkout
          </Button>
          <Link href="/shop" className="mt-4 block text-center text-xs text-overlay/40 hover:text-gold">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

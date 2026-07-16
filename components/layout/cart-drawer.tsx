"use client";

import Image from "next/image";
import { Drawer } from "@/components/ui/drawer";
import { QuantityInput } from "@/components/ui/quantity-input";
import { ButtonLink } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency } from "@/lib/utils";
import { X } from "lucide-react";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal());

  return (
    <Drawer open={open} onClose={onClose} title={`Your Bag (${items.length})`}>
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-overlay/50">Your bag is empty.</p>
          <ButtonLink href="/shop" onClick={onClose}>
            Shop the Collection
          </ButtonLink>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
            {items.map((item) => (
              <div key={item.variantId} className="flex gap-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-overlay/5">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-2" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-serif text-sm text-fg">{item.name}</p>
                      <p className="text-xs text-overlay/50">{item.size}</p>
                    </div>
                    <button
                      onClick={() => removeItem(item.variantId)}
                      aria-label="Remove item"
                      className="text-overlay/40 hover:text-red-300"
                    >
                      <X size={15} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <QuantityInput
                      quantity={item.quantity}
                      onChange={(q) => updateQuantity(item.variantId, q)}
                      max={item.stock}
                    />
                    <span className="text-sm text-fg">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-overlay/10 px-6 py-6">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-overlay/60">Subtotal</span>
              <span className="font-serif text-lg text-fg">{formatCurrency(subtotal)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <ButtonLink href="/cart" variant="secondary" onClick={onClose}>
                View Bag
              </ButtonLink>
              <ButtonLink href="/checkout" onClick={onClose}>
                Checkout
              </ButtonLink>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

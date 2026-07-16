"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Product } from "@/types";
import { Modal } from "@/components/ui/modal";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/ui/quantity-input";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { useToastStore } from "@/lib/store/toast-store";

export function QuickViewModal({
  product,
  open,
  onClose,
}: {
  product: Product;
  open: boolean;
  onClose: () => void;
}) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  function handleAdd() {
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      size: variant.size,
      price: variant.price,
      quantity,
      stock: variant.stock,
    });
    showToast(`${product.name} (${variant.size}) added to cart.`);
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose}>
      <div className="grid gap-8 sm:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-md bg-overlay/5">
          <Image src={product.images[0]} alt={product.name} fill className="object-contain p-6" />
        </div>
        <div>
          <p className="text-[11px] uppercase tracking-widest text-gold">{product.collection}</p>
          <h3 className="mt-2 font-serif text-2xl text-fg">{product.name}</h3>
          <p className="mt-1 text-sm italic text-overlay/50">{product.tagline}</p>
          <div className="mt-3">
            <StarRating rating={product.rating} showValue />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-overlay/70">{product.shortDescription}</p>
          <p className="mt-4 font-serif text-2xl text-fg">{formatCurrency(variant.price)}</p>

          <div className="mt-5 flex flex-wrap gap-2">
            {product.variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setVariantId(v.id)}
                className={`rounded-sm border px-3 py-1.5 text-xs transition-colors ${
                  v.id === variantId
                    ? "border-gold bg-gold text-ink"
                    : "border-overlay/20 text-overlay/70 hover:border-gold hover:text-gold"
                }`}
              >
                {v.size}
              </button>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-4">
            <QuantityInput quantity={quantity} onChange={setQuantity} max={variant.stock} />
            <Button onClick={handleAdd} disabled={variant.stock === 0} className="flex-1">
              {variant.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
          </div>

          <Link
            href={`/shop/${product.slug}`}
            onClick={onClose}
            className="mt-5 inline-block text-xs uppercase tracking-widest text-overlay/50 underline underline-offset-4 hover:text-gold"
          >
            View full details
          </Link>
        </div>
      </div>
    </Modal>
  );
}

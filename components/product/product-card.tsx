"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { cn, formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { QuickViewModal } from "@/components/product/quick-view-modal";
import { useRouter } from "next/navigation";

export function ProductCard({ product }: { product: Product }) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const currentUser = useAuthStore((s) => s.currentUser);
  const showToast = useToastStore((s) => s.show);
  const router = useRouter();

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    const variant = product.variants[0];
    addItem({
      productId: product.id,
      variantId: variant.id,
      name: product.name,
      slug: product.slug,
      image: product.images[0],
      size: variant.size,
      price: variant.price,
      quantity: 1,
      stock: variant.stock,
    });
    showToast(`${product.name} added to cart.`);
  }

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    if (!currentUser) {
      showToast("Sign in to save items to your wishlist.", "error");
      router.push("/auth/login");
      return;
    }
    const wasWishlisted = isWishlisted;
    try {
      await toggleWishlist(product.id);
      showToast(
        wasWishlisted ? `${product.name} removed from wishlist.` : `${product.name} added to wishlist.`,
        "info"
      );
    } catch {
      showToast("Could not update wishlist. Please try again.", "error");
    }
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="group relative"
      >
        <Link href={`/shop/${product.slug}`} className="block">
          <div className="relative aspect-square overflow-hidden rounded-md bg-overlay/[0.04] border border-overlay/10">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-contain p-6 transition-transform duration-700 group-hover:scale-105"
            />

            <div className="absolute left-3 top-3 flex flex-col gap-2">
              {product.isNew && <Badge variant="gold">New</Badge>}
              {product.isLimitedEdition && <Badge variant="outline">Limited</Badge>}
            </div>

            <button
              onClick={handleWishlist}
              aria-label="Toggle wishlist"
              className="absolute right-3 top-3 rounded-full bg-black/60 p-2 backdrop-blur-sm transition-colors hover:bg-black"
            >
              <Heart
                size={16}
                className={cn(isWishlisted ? "fill-gold text-gold" : "text-overlay/80")}
              />
            </button>

            <button
              onClick={(e) => {
                e.preventDefault();
                setQuickViewOpen(true);
              }}
              className="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 rounded-sm bg-black/80 py-2.5 text-xs font-semibold uppercase tracking-wider text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
            >
              <Eye size={14} /> Quick View
            </button>
          </div>

          <div className="mt-4 space-y-1.5">
            <p className="text-[11px] uppercase tracking-widest text-gold">{product.collection}</p>
            <h3 className="font-serif text-lg text-fg group-hover:text-gold transition-colors">
              {product.name}
            </h3>
            <p className="line-clamp-1 text-xs text-overlay/50">{product.shortDescription}</p>
            <div className="flex items-center justify-between pt-1">
              <StarRating rating={product.rating} />
              <div className="flex items-baseline gap-2">
                {product.compareAtPrice && (
                  <span className="text-xs text-overlay/40 line-through">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
                <span className="font-serif text-base text-fg">
                  {formatCurrency(product.price)}
                </span>
              </div>
            </div>
          </div>
        </Link>

        <Button
          variant="secondary"
          size="sm"
          className="mt-3 w-full"
          onClick={handleAddToCart}
          disabled={product.stock === 0}
        >
          {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
        </Button>
      </motion.div>

      <QuickViewModal product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, Clock, Radar, CalendarDays, Sun, ShieldCheck, Truck } from "lucide-react";
import { Product, Review } from "@/types";
import { ProductGallery } from "@/components/product/product-gallery";
import { NotesPyramidDisplay } from "@/components/product/notes-pyramid";
import { ReviewSection } from "@/components/product/review-section";
import { RelatedProducts } from "@/components/product/related-products";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { QuantityInput } from "@/components/ui/quantity-input";
import { Accordion } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cart-store";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useToastStore } from "@/lib/store/toast-store";

type Tab = "description" | "ingredients" | "reviews";

export function ProductDetail({
  product,
  reviews,
  related,
  frequentlyBoughtWith,
}: {
  product: Product;
  reviews: Review[];
  related: Product[];
  frequentlyBoughtWith: Product[];
}) {
  const [variantId, setVariantId] = useState(product.variants[0].id);
  const [quantity, setQuantity] = useState(1);
  const [tab, setTab] = useState<Tab>("description");

  const addItem = useCartStore((s) => s.addItem);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const showToast = useToastStore((s) => s.show);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];

  function handleAddToCart() {
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
  }

  const performanceStats = [
    { icon: Clock, label: "Longevity", value: product.longevity },
    { icon: Radar, label: "Projection", value: product.projection },
    { icon: CalendarDays, label: "Occasion", value: product.occasion.join(", ") },
    { icon: Sun, label: "Season", value: product.season.join(", ") },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <nav className="mb-8 text-xs text-white/40">
        <Link href="/" className="hover:text-gold">Home</Link> /{" "}
        <Link href="/shop" className="hover:text-gold">Shop</Link> /{" "}
        <span className="text-white/60">{product.name}</span>
      </nav>

      <div className="grid gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />

        <div>
          <div className="flex items-center gap-2">
            {product.isNew && <Badge variant="gold">New</Badge>}
            {product.isLimitedEdition && <Badge variant="outline">Limited Edition</Badge>}
          </div>
          <p className="mt-4 text-xs uppercase tracking-widest text-gold">{product.collection} Collection</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold text-brand-white">{product.name}</h1>
          <p className="mt-2 text-sm italic text-white/50">{product.tagline}</p>

          <div className="mt-4 flex items-center gap-3">
            <StarRating rating={product.rating} showValue />
            <span className="text-xs text-white/40">({product.reviewCount} reviews)</span>
          </div>

          <p className="mt-6 font-serif text-3xl text-brand-white">{formatCurrency(variant.price)}</p>

          <p className="mt-6 text-sm leading-relaxed text-white/70">{product.shortDescription}</p>

          <div className="mt-6">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/60">Size</p>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVariantId(v.id)}
                  className={cn(
                    "rounded-sm border px-4 py-2 text-sm transition-colors",
                    v.id === variantId
                      ? "border-gold bg-gold text-matte-black"
                      : "border-white/20 text-white/70 hover:border-gold hover:text-gold"
                  )}
                >
                  {v.size}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-white/40">
              {variant.stock > 0 ? `${variant.stock} in stock` : "Out of stock"} · SKU: {variant.sku}
            </p>
          </div>

          <div className="mt-6 flex items-center gap-4">
            <QuantityInput quantity={quantity} onChange={setQuantity} max={variant.stock} />
            <Button onClick={handleAddToCart} disabled={variant.stock === 0} size="lg" className="flex-1">
              {variant.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </Button>
            <button
              onClick={() => {
                toggleWishlist(product.id);
                showToast(
                  isWishlisted ? "Removed from wishlist." : "Added to wishlist.",
                  "info"
                );
              }}
              aria-label="Toggle wishlist"
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm border border-white/15 transition-colors hover:border-gold"
            >
              <Heart size={20} className={isWishlisted ? "fill-gold text-gold" : "text-white/70"} />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
            {performanceStats.map((stat) => (
              <div key={stat.label}>
                <stat.icon size={18} className="text-gold" />
                <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-white/50">
                  {stat.label}
                </p>
                <p className="mt-1 text-sm text-brand-white">{stat.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50">
            <p className="flex items-center gap-2"><ShieldCheck size={14} className="text-gold" /> Secure checkout via PCI-DSS compliant gateways</p>
            <p className="flex items-center gap-2"><Truck size={14} className="text-gold" /> Free shipping within Nigeria on orders over $200</p>
          </div>
        </div>
      </div>

      <div className="mt-20 grid gap-16 lg:grid-cols-[280px_1fr]">
        <div>
          <h3 className="mb-4 font-serif text-xl text-brand-white">Fragrance Notes</h3>
          <NotesPyramidDisplay notes={product.notes} />
        </div>

        <div>
          <div className="flex gap-8 border-b border-white/10">
            {(["description", "ingredients", "reviews"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={cn(
                  "border-b-2 pb-4 text-sm font-medium uppercase tracking-widest transition-colors",
                  tab === t ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white"
                )}
              >
                {t === "reviews" ? `Reviews (${reviews.length})` : t}
              </button>
            ))}
          </div>

          <div className="pt-8">
            {tab === "description" && (
              <p className="text-sm leading-relaxed text-white/70">{product.longDescription}</p>
            )}
            {tab === "ingredients" && (
              <Accordion
                items={[
                  {
                    question: "Full Ingredients Disclosure",
                    answer: product.ingredients.join(", "),
                  },
                  {
                    question: "Concentration",
                    answer: "Eau de Parfum — 20-25% fragrance oil concentration.",
                  },
                ]}
              />
            )}
            {tab === "reviews" && <ReviewSection reviews={reviews} averageRating={product.rating} />}
          </div>
        </div>
      </div>

      <RelatedProducts
        eyebrow="Complete the Set"
        title="Frequently Bought Together"
        products={frequentlyBoughtWith}
      />
      <RelatedProducts eyebrow="Curated for You" title="You May Also Like" products={related} />
    </div>
  );
}

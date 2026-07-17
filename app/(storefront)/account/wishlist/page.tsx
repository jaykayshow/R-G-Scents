"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { useWishlistStore } from "@/lib/store/wishlist-store";
import { useCartStore } from "@/lib/store/cart-store";
import { useToastStore } from "@/lib/store/toast-store";
import { useProductsStore } from "@/lib/store/products-store";
import { formatCurrency } from "@/lib/utils";

export default function WishlistPage() {
  const wishlistIds = useWishlistStore((s) => s.productIds);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const products = useProductsStore((s) => s.products);
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  return (
    <div>
      <h2 className="mb-6 font-serif text-xl text-fg">My Wishlist</h2>
      {wishlistProducts.length === 0 ? (
        <Card className="flex flex-col items-center gap-4 p-12 text-center">
          <Heart size={32} className="text-overlay/30" />
          <p className="text-sm text-overlay/50">Your wishlist is empty.</p>
          <Link href="/shop">
            <Button variant="secondary">Browse the Collection</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistProducts.map((product) => (
            <Card key={product.id} className="p-5">
              <div className="relative aspect-square overflow-hidden rounded-sm bg-overlay/5">
                <Image src={product.images[0]} alt={product.name} fill className="object-contain p-6" />
              </div>
              <Link href={`/shop/${product.slug}`}>
                <p className="mt-4 font-serif text-lg text-fg hover:text-gold">{product.name}</p>
              </Link>
              <StarRating rating={product.rating} className="mt-1" />
              <p className="mt-2 font-serif text-fg">{formatCurrency(product.price)}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
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
                  }}
                >
                  <ShoppingBag size={14} /> Add to Cart
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    await toggleWishlist(product.id);
                    showToast("Removed from wishlist.", "info");
                  }}
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

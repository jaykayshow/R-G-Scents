"use client";

import { use } from "react";
import Link from "next/link";
import { useProductsStore } from "@/lib/store/products-store";
import { useReviewsStore } from "@/lib/store/reviews-store";
import { ProductDetail } from "@/components/product/product-detail";

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const products = useProductsStore((s) => s.products);
  const reviews = useReviewsStore((s) => s.reviews);

  const product = products.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <h1 className="font-serif text-3xl text-fg">Product Not Found</h1>
        <p className="text-sm text-overlay/50">This fragrance may have been retired from the collection.</p>
        <Link href="/shop" className="text-xs uppercase tracking-widest text-gold hover:underline">
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  const productReviews = reviews.filter((r) => r.productId === product.id && r.status === "approved");
  const related = products.filter((p) => p.id !== product.id).slice(0, 4);
  const frequentlyBoughtWith = products.filter((p) => p.id !== product.id).slice(4, 8);

  return (
    <ProductDetail
      product={product}
      reviews={productReviews}
      related={related}
      frequentlyBoughtWith={frequentlyBoughtWith.length ? frequentlyBoughtWith : related}
    />
  );
}

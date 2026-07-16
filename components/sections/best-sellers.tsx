"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProductsStore } from "@/lib/store/products-store";
import { SectionHeading } from "@/components/ui/typography";
import { ProductCard } from "@/components/product/product-card";

export function BestSellers() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const products = useProductsStore((s) => s.products);
  const bestSellers = [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 5);

  function scroll(direction: "left" | "right") {
    scrollRef.current?.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
  }

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <SectionHeading
            align="left"
            eyebrow="Ranked by Demand"
            title="Best Sellers"
            className="mb-0"
          />
          <div className="hidden gap-2 sm:flex">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="rounded-full border border-overlay/15 p-2.5 text-overlay/70 hover:border-gold hover:text-gold"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="rounded-full border border-overlay/15 p-2.5 text-overlay/70 hover:border-gold hover:text-gold"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          ref={scrollRef}
          className="mt-12 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          {bestSellers.map((product) => (
            <div key={product.id} className="w-56 shrink-0 snap-start sm:w-64">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

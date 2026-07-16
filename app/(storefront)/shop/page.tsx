import { Suspense } from "react";
import { ShopContent } from "@/components/shop/shop-content";

export const metadata = {
  title: "Shop | R&G Scents — The Billionaire Collection",
  description: "Browse the full Billionaire Collection by R&G Scents.",
};

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <ShopContent />
    </Suspense>
  );
}

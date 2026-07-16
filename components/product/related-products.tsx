import { Product } from "@/types";
import { SectionHeading } from "@/components/ui/typography";
import { ProductCard } from "@/components/product/product-card";

export function RelatedProducts({
  title,
  eyebrow,
  products,
}: {
  title: string;
  eyebrow: string;
  products: Product[];
}) {
  if (!products.length) return null;
  return (
    <div className="mt-24">
      <SectionHeading align="left" eyebrow={eyebrow} title={title} className="mb-8" />
      <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

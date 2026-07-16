import { products } from "@/lib/mock-data/products";
import { SectionHeading } from "@/components/ui/typography";
import { ProductCard } from "@/components/product/product-card";

export function FeaturedCollection() {
  return (
    <section id="featured-collection" className="bg-matte-black py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="The Billionaire Collection"
          title="Five Fragrances. One Legacy."
          description="Each scent in the collection is engineered for a different facet of power — from boardroom command to after-hours magnetism."
        />
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

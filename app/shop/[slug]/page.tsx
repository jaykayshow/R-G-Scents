import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, products } from "@/lib/mock-data/products";
import { getReviewsForProduct } from "@/lib/mock-data/reviews";
import { ProductDetail } from "@/components/product/product-detail";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};
  return {
    title: `${product.name} | R&G Scents — The Billionaire Collection`,
    description: product.shortDescription,
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const reviews = getReviewsForProduct(product.id);
  const related = getRelatedProducts(product, 4);
  const frequentlyBoughtWith = getRelatedProducts(product, 8).slice(4, 8);

  return (
    <ProductDetail
      product={product}
      reviews={reviews}
      related={related}
      frequentlyBoughtWith={frequentlyBoughtWith.length ? frequentlyBoughtWith : related}
    />
  );
}

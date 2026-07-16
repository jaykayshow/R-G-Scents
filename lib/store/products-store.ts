import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Product, ProductVariant } from "@/types";
import { products as seedProducts } from "@/lib/mock-data/products";

function recomputeStock(product: Product): Product {
  return { ...product, stock: product.variants.reduce((sum, v) => sum + v.stock, 0) };
}

interface ProductsState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  deleteProducts: (ids: string[]) => void;
  bulkUpdate: (ids: string[], patch: Partial<Product>) => void;
  setVariantStock: (productId: string, variantId: string, newStock: number) => void;
  getBySlug: (slug: string) => Product | undefined;
  getById: (id: string) => Product | undefined;
}

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      products: seedProducts,
      addProduct: (product) => set((state) => ({ products: [product, ...state.products] })),
      updateProduct: (id, patch) =>
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? recomputeStock({ ...p, ...patch }) : p)),
        })),
      deleteProduct: (id) => set((state) => ({ products: state.products.filter((p) => p.id !== id) })),
      deleteProducts: (ids) =>
        set((state) => ({ products: state.products.filter((p) => !ids.includes(p.id)) })),
      bulkUpdate: (ids, patch) =>
        set((state) => ({
          products: state.products.map((p) => (ids.includes(p.id) ? recomputeStock({ ...p, ...patch }) : p)),
        })),
      setVariantStock: (productId, variantId, newStock) =>
        set((state) => ({
          products: state.products.map((p) => {
            if (p.id !== productId) return p;
            const variants: ProductVariant[] = p.variants.map((v) =>
              v.id === variantId ? { ...v, stock: Math.max(0, newStock) } : v
            );
            return recomputeStock({ ...p, variants });
          }),
        })),
      getBySlug: (slug) => get().products.find((p) => p.slug === slug),
      getById: (id) => get().products.find((p) => p.id === id),
    }),
    { name: "rg-scents-products" }
  )
);

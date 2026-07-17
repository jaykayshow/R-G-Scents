import { create } from "zustand";
import { Product } from "@/types";
import { apiClient } from "@/lib/api-client";

function recomputeStock(product: Product): Product {
  return { ...product, stock: product.variants.reduce((sum, v) => sum + v.stock, 0) };
}

interface ProductsState {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  deleteProducts: (ids: string[]) => Promise<void>;
  bulkUpdate: (ids: string[], patch: Partial<Product>) => Promise<void>;
  setVariantStock: (productId: string, variantId: string, newStock: number, reason?: string) => Promise<void>;
  getBySlug: (slug: string) => Product | undefined;
  getById: (id: string) => Product | undefined;
}

export const useProductsStore = create<ProductsState>()((set, get) => ({
  products: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    set({ loading: true, error: null });
    try {
      const products = await apiClient.products.list();
      set({ products, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load products.", loading: false });
    }
  },

  addProduct: async (product) => {
    const created = await apiClient.products.create(product);
    set((state) => ({ products: [created, ...state.products] }));
  },

  updateProduct: async (id, patch) => {
    const current = get().products.find((p) => p.id === id);
    if (!current) return;
    const merged = recomputeStock({ ...current, ...patch });
    const updated = await apiClient.products.update(id, merged);
    set((state) => ({ products: state.products.map((p) => (p.id === id ? updated : p)) }));
  },

  deleteProduct: async (id) => {
    await apiClient.products.delete(id);
    set((state) => ({ products: state.products.filter((p) => p.id !== id) }));
  },

  deleteProducts: async (ids) => {
    await apiClient.products.bulkDelete(ids);
    set((state) => ({ products: state.products.filter((p) => !ids.includes(p.id)) }));
  },

  bulkUpdate: async (ids, patch) => {
    const { products, updateProduct } = get();
    const targets = products.filter((p) => ids.includes(p.id));
    await Promise.all(targets.map((p) => updateProduct(p.id, patch)));
  },

  setVariantStock: async (productId, variantId, newStock, reason = "Manual adjustment") => {
    await apiClient.products.adjustStock(productId, variantId, newStock, reason);
    set((state) => ({
      products: state.products.map((p) => {
        if (p.id !== productId) return p;
        const variants = p.variants.map((v) => (v.id === variantId ? { ...v, stock: newStock } : v));
        return recomputeStock({ ...p, variants });
      }),
    }));
  },

  getBySlug: (slug) => get().products.find((p) => p.slug === slug),
  getById: (id) => get().products.find((p) => p.id === id),
}));

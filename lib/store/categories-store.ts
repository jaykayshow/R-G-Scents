import { create } from "zustand";
import { Category } from "@/types";
import { apiClient } from "@/lib/api-client";

interface CategoriesState {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: () => Promise<void>;
  addCategory: (category: Pick<Category, "name" | "description">) => Promise<void>;
  updateCategory: (id: string, patch: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export const useCategoriesStore = create<CategoriesState>()((set) => ({
  categories: [],
  loading: false,
  error: null,

  fetchCategories: async () => {
    set({ loading: true, error: null });
    try {
      const categories = await apiClient.categories.list();
      set({ categories, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load categories.", loading: false });
    }
  },

  addCategory: async (category) => {
    const created = await apiClient.categories.create(category.name, category.description);
    set((state) => ({ categories: [...state.categories, created] }));
  },

  updateCategory: async (id, patch) => {
    const updated = await apiClient.categories.update(id, patch);
    set((state) => ({ categories: state.categories.map((c) => (c.id === id ? updated : c)) }));
  },

  deleteCategory: async (id) => {
    await apiClient.categories.delete(id);
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },
}));

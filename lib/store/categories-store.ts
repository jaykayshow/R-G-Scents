import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Category } from "@/types";
import { categories as seedCategories } from "@/lib/mock-data/categories";

interface CategoriesState {
  categories: Category[];
  addCategory: (category: Category) => void;
  updateCategory: (id: string, patch: Partial<Category>) => void;
  deleteCategory: (id: string) => void;
}

export const useCategoriesStore = create<CategoriesState>()(
  persist(
    (set) => ({
      categories: seedCategories,
      addCategory: (category) => set((state) => ({ categories: [...state.categories, category] })),
      updateCategory: (id, patch) =>
        set((state) => ({ categories: state.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)) })),
      deleteCategory: (id) => set((state) => ({ categories: state.categories.filter((c) => c.id !== id) })),
    }),
    { name: "rg-scents-categories" }
  )
);

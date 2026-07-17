import { create } from "zustand";
import { CollectionMeta, CollectionSlug } from "@/types";
import { apiClient } from "@/lib/api-client";

interface CollectionsState {
  collections: CollectionMeta[];
  loading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  updateCollection: (slug: CollectionSlug, patch: Partial<CollectionMeta>) => Promise<void>;
}

export const useCollectionsStore = create<CollectionsState>()((set) => ({
  collections: [],
  loading: false,
  error: null,

  fetchCollections: async () => {
    set({ loading: true, error: null });
    try {
      const collections = await apiClient.collections.list();
      set({ collections, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load collections.", loading: false });
    }
  },

  updateCollection: async (slug, patch) => {
    const updated = await apiClient.collections.update(slug, patch);
    set((state) => ({
      collections: state.collections.map((c) => (c.slug === slug ? updated : c)),
    }));
  },
}));

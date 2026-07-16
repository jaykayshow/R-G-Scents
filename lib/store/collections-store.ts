import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CollectionMeta, CollectionSlug } from "@/types";
import { collectionsMeta as seedCollections } from "@/lib/mock-data/collections";

interface CollectionsState {
  collections: CollectionMeta[];
  updateCollection: (slug: CollectionSlug, patch: Partial<CollectionMeta>) => void;
}

export const useCollectionsStore = create<CollectionsState>()(
  persist(
    (set) => ({
      collections: seedCollections,
      updateCollection: (slug, patch) =>
        set((state) => ({
          collections: state.collections.map((c) => (c.slug === slug ? { ...c, ...patch } : c)),
        })),
    }),
    { name: "rg-scents-collections" }
  )
);

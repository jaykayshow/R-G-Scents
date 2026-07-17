"use client";

import { useEffect } from "react";
import { useProductsStore } from "@/lib/store/products-store";
import { useCategoriesStore } from "@/lib/store/categories-store";
import { useCollectionsStore } from "@/lib/store/collections-store";
import { useBannersStore } from "@/lib/store/banners-store";
import { useSettingsStore } from "@/lib/store/settings-store";

/**
 * Mounted once per layout so catalog data is fetched fresh on every
 * hard navigation/refresh, independent of which page loads first.
 */
export function CatalogHydration() {
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const fetchCategories = useCategoriesStore((s) => s.fetchCategories);
  const fetchCollections = useCollectionsStore((s) => s.fetchCollections);
  const fetchBanners = useBannersStore((s) => s.fetchBanners);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchCollections();
    fetchBanners();
    fetchSettings();
  }, [fetchProducts, fetchCategories, fetchCollections, fetchBanners, fetchSettings]);

  return null;
}

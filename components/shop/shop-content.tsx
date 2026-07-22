"use client";

import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { useProductsStore } from "@/lib/store/products-store";
import { CollectionSlug, Gender } from "@/types";
import { ProductCard } from "@/components/product/product-card";
import { Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const PRICE_FILTER_MIN = 300000;
const PRICE_FILTER_MAX = 700000;
const PRICE_FILTER_STEP = 5000;

type SortOption = "popularity" | "newest" | "best-selling" | "price-asc" | "price-desc";

const collectionOptions: { value: CollectionSlug; label: string }[] = [
  { value: "legacy", label: "Legacy" },
  { value: "reserve", label: "Reserve" },
  { value: "royale", label: "Royale" },
  { value: "elite", label: "Elite" },
  { value: "noir", label: "Noir" },
];

const genderOptions: Gender[] = ["Men", "Women", "Unisex"];

const PAGE_SIZE = 8;

export function ShopContent() {
  const products = useProductsStore((s) => s.products);
  const loading = useProductsStore((s) => s.loading);
  const error = useProductsStore((s) => s.error);
  const fetchProducts = useProductsStore((s) => s.fetchProducts);
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCollections, setSelectedCollections] = useState<CollectionSlug[]>(
    searchParams.get("collection")
      ? [searchParams.get("collection") as CollectionSlug]
      : []
  );
  const [selectedGenders, setSelectedGenders] = useState<Gender[]>([]);
  const [maxPrice, setMaxPrice] = useState(PRICE_FILTER_MAX);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState<SortOption>("popularity");
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [query, selectedCollections, selectedGenders, maxPrice, inStockOnly, sort]);

  useEffect(() => {
    const q = searchParams.get("q");
    const collection = searchParams.get("collection");
    setQuery(q ?? "");
    setSelectedCollections(collection ? [collection as CollectionSlug] : []);
  }, [searchParams]);

  function toggleCollection(value: CollectionSlug) {
    setSelectedCollections((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  function toggleGender(value: Gender) {
    setSelectedGenders((prev) =>
      prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]
    );
  }

  function clearFilters() {
    setSelectedCollections([]);
    setSelectedGenders([]);
    setMaxPrice(PRICE_FILTER_MAX);
    setInStockOnly(false);
    setQuery("");
  }

  const filtered = useMemo(() => {
    let result = products.filter((p) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const haystack = `${p.name} ${p.collection} ${p.shortDescription} ${p.notes.top.join(" ")} ${p.notes.middle.join(" ")} ${p.notes.base.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (selectedCollections.length && !selectedCollections.includes(p.collection)) return false;
      if (selectedGenders.length && !selectedGenders.includes(p.gender)) return false;
      if (p.price > maxPrice) return false;
      if (inStockOnly && p.stock === 0) return false;
      return true;
    });

    switch (sort) {
      case "newest":
        result = [...result].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "best-selling":
        result = [...result].sort((a, b) => b.salesCount - a.salesCount);
        break;
      case "price-asc":
        result = [...result].sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result = [...result].sort((a, b) => b.price - a.price);
        break;
      default:
        result = [...result].sort((a, b) => b.rating - a.rating);
    }
    return result;
  }, [products, query, selectedCollections, selectedGenders, maxPrice, inStockOnly, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const activeFilterCount =
    selectedCollections.length + selectedGenders.length + (inStockOnly ? 1 : 0) + (maxPrice < PRICE_FILTER_MAX ? 1 : 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Shop</span>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-fg">
          The Billionaire Collection
        </h1>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search fragrances, notes, collections..."
          className="w-full max-w-md rounded-sm border border-overlay/15 bg-overlay/[0.03] px-4 py-2.5 text-sm text-fg placeholder:text-overlay/35 focus:border-gold focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 rounded-sm border border-overlay/15 px-4 py-2.5 text-xs uppercase tracking-widest text-overlay/70 hover:border-gold hover:text-gold lg:hidden"
          >
            <SlidersHorizontal size={14} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <Select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="w-48">
            <option value="popularity">Sort: Popularity</option>
            <option value="newest">Sort: Newest</option>
            <option value="best-selling">Sort: Best Selling</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </Select>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
        {/* Desktop filter sidebar */}
        <aside className="hidden lg:block">
          <FilterPanel
            selectedCollections={selectedCollections}
            toggleCollection={toggleCollection}
            selectedGenders={selectedGenders}
            toggleGender={toggleGender}
            maxPrice={maxPrice}
            setMaxPrice={setMaxPrice}
            inStockOnly={inStockOnly}
            setInStockOnly={setInStockOnly}
            clearFilters={clearFilters}
          />
        </aside>

        <div>
          <p className="mb-6 text-xs uppercase tracking-widest text-overlay/40">
            {filtered.length} {filtered.length === 1 ? "fragrance" : "fragrances"} found
          </p>

          {loading && products.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-sm text-overlay/50">Loading fragrances…</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <Button variant="secondary" onClick={() => fetchProducts()}>
                Retry
              </Button>
            </div>
          ) : paginated.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="font-serif text-xl text-fg">No fragrances match your filters.</p>
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 xl:grid-cols-4">
              {paginated.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-9 w-9 rounded-sm text-sm transition-colors ${
                    page === i + 1
                      ? "bg-gold text-ink"
                      : "border border-overlay/15 text-overlay/60 hover:border-gold hover:text-gold"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-[110] lg:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-full max-w-xs overflow-y-auto bg-surface p-6">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="font-serif text-lg text-fg">Filters</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close filters">
                <X size={20} className="text-overlay/60" />
              </button>
            </div>
            <FilterPanel
              selectedCollections={selectedCollections}
              toggleCollection={toggleCollection}
              selectedGenders={selectedGenders}
              toggleGender={toggleGender}
              maxPrice={maxPrice}
              setMaxPrice={setMaxPrice}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              clearFilters={clearFilters}
            />
            <Button className="mt-6 w-full" onClick={() => setFiltersOpen(false)}>
              View {filtered.length} Results
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  selectedCollections,
  toggleCollection,
  selectedGenders,
  toggleGender,
  maxPrice,
  setMaxPrice,
  inStockOnly,
  setInStockOnly,
  clearFilters,
}: {
  selectedCollections: CollectionSlug[];
  toggleCollection: (v: CollectionSlug) => void;
  selectedGenders: Gender[];
  toggleGender: (v: Gender) => void;
  maxPrice: number;
  setMaxPrice: (v: number) => void;
  inStockOnly: boolean;
  setInStockOnly: (v: boolean) => void;
  clearFilters: () => void;
}) {
  return (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Collection</h4>
        <div className="space-y-2">
          {collectionOptions.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2.5 text-sm text-overlay/70">
              <input
                type="checkbox"
                checked={selectedCollections.includes(opt.value)}
                onChange={() => toggleCollection(opt.value)}
                className="h-4 w-4 rounded-sm border-overlay/30 bg-transparent accent-[#c9a24b]"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Gender</h4>
        <div className="space-y-2">
          {genderOptions.map((opt) => (
            <label key={opt} className="flex items-center gap-2.5 text-sm text-overlay/70">
              <input
                type="checkbox"
                checked={selectedGenders.includes(opt)}
                onChange={() => toggleGender(opt)}
                className="h-4 w-4 rounded-sm border-overlay/30 bg-transparent accent-[#c9a24b]"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">
          Max Price: {formatCurrency(maxPrice)}
        </h4>
        <input
          type="range"
          min={PRICE_FILTER_MIN}
          max={PRICE_FILTER_MAX}
          step={PRICE_FILTER_STEP}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#c9a24b]"
        />
      </div>

      <div>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Availability</h4>
        <label className="flex items-center gap-2.5 text-sm text-overlay/70">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => setInStockOnly(e.target.checked)}
            className="h-4 w-4 rounded-sm border-overlay/30 bg-transparent accent-[#c9a24b]"
          />
          In Stock Only
        </label>
      </div>

      <button
        onClick={clearFilters}
        className="text-xs uppercase tracking-widest text-overlay/50 underline underline-offset-4 hover:text-gold"
      >
        Clear All Filters
      </button>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Trash2, Upload, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/input";
import { useProductsStore } from "@/lib/store/products-store";
import { useToastStore } from "@/lib/store/toast-store";
import { Product, ProductVariant } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

export default function AdminProductsPage() {
  const products = useProductsStore((s) => s.products);
  const loading = useProductsStore((s) => s.loading);
  const storeError = useProductsStore((s) => s.error);
  const deleteProducts = useProductsStore((s) => s.deleteProducts);
  const bulkUpdate = useProductsStore((s) => s.bulkUpdate);
  const addProduct = useProductsStore((s) => s.addProduct);
  const showToast = useToastStore((s) => s.show);

  function errorMessage(err: unknown) {
    return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
  }

  const [query, setQuery] = useState("");
  const [collectionFilter, setCollectionFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [importOpen, setImportOpen] = useState(false);
  const [csvText, setCsvText] = useState("");

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (query.trim() && !p.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      if (collectionFilter !== "all" && p.collection !== collectionFilter) return false;
      return true;
    });
  }, [products, query, collectionFilter]);

  async function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected product(s)? This cannot be undone.`)) return;
    try {
      await deleteProducts(selectedIds);
      showToast(`${selectedIds.length} product(s) deleted.`);
      setSelectedIds([]);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleBulkDeactivateStock() {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(
        selectedIds.map((id) => {
          const product = products.find((p) => p.id === id);
          if (!product) return Promise.resolve();
          return bulkUpdate([id], { variants: product.variants.map((v) => ({ ...v, stock: 0 })) });
        })
      );
      showToast(`${selectedIds.length} product(s) marked out of stock.`);
      setSelectedIds([]);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleImport() {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    let imported = 0;
    for (const [index, line] of lines.entries()) {
      const [name, collection, priceStr, stockStr] = line.split(",").map((s) => s.trim());
      if (!name || !collection || !priceStr) continue;
      const price = Number(priceStr) || 0;
      const stock = Number(stockStr) || 0;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const id = `p-${slug}-${Date.now()}-${index}`;
      const variant: ProductVariant = {
        id: `v-${slug}-50-${Date.now()}-${index}`,
        size: "50ml",
        sku: `RG-${slug.slice(0, 3).toUpperCase()}-50`,
        barcode: String(Date.now()).slice(-10),
        price,
        stock,
      };
      const newProduct: Product = {
        id,
        slug: `${slug}-${index}`,
        name,
        collection: (["legacy", "reserve", "royale", "elite", "noir"].includes(collection)
          ? collection
          : "legacy") as Product["collection"],
        tagline: "",
        shortDescription: "Imported via CSV — edit this product to complete its details.",
        longDescription: "",
        gender: "Unisex",
        price,
        images: ["/products/legacy.png"],
        notes: { top: [], middle: [], base: [] },
        longevity: "Moderate",
        projection: "Moderate",
        occasion: [],
        season: [],
        ingredients: [],
        rating: 0,
        reviewCount: 0,
        salesCount: 0,
        isNew: true,
        isLimitedEdition: false,
        createdAt: new Date().toISOString(),
        variants: [variant],
        stock,
      };
      try {
        await addProduct(newProduct);
        imported += 1;
      } catch (err) {
        showToast(`Skipped "${name}": ${errorMessage(err)}`, "error");
      }
    }
    showToast(`Imported ${imported} product(s) from CSV.`);
    setCsvText("");
    setImportOpen(false);
  }

  async function handleDeleteOne(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteProducts([id]);
      showToast(`${name} deleted.`);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: "product",
      label: "Product",
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-overlay/5">
            <Image src={p.images[0]} alt={p.name} fill className="object-contain p-1" />
          </div>
          <div>
            <Link href={`/admin/products/${p.id}`} className="font-medium text-fg hover:text-gold">
              {p.name}
            </Link>
            <p className="text-xs capitalize text-overlay/40">{p.collection}</p>
          </div>
        </div>
      ),
    },
    { key: "price", label: "Price", sortValue: (p) => p.price, render: (p) => formatCurrency(p.price) },
    {
      key: "stock",
      label: "Stock",
      sortValue: (p) => p.stock,
      render: (p) => (
        <span className={p.stock === 0 ? "text-red-400" : p.stock <= 15 ? "text-amber-400" : "text-overlay/80"}>
          {p.stock} units
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (p) => (
        <Badge variant={p.stock === 0 ? "danger" : "gold"}>{p.stock === 0 ? "Out of Stock" : "Active"}</Badge>
      ),
    },
    { key: "sales", label: "Sold", sortValue: (p) => p.salesCount, render: (p) => p.salesCount },
    {
      key: "actions",
      label: "",
      render: (p) => (
        <div className="flex items-center justify-end gap-3">
          <Link href={`/admin/products/${p.id}`} className="text-xs text-gold hover:underline">
            Edit
          </Link>
          <button
            onClick={() => handleDeleteOne(p.id, p.name)}
            className="text-xs text-overlay/40 hover:text-red-300"
          >
            Delete
          </button>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description={`${products.length} products in the catalog`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={() => setImportOpen(true)}>
              <Upload size={14} /> Import CSV
            </Button>
            <Link href="/admin/products/new">
              <Button size="sm">
                <Plus size={14} /> Add Product
              </Button>
            </Link>
          </>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-overlay/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-sm border border-overlay/15 bg-overlay/[0.03] py-2 pl-9 pr-3 text-sm text-fg placeholder:text-overlay/30 focus:border-gold focus:outline-none"
          />
        </div>
        <Select value={collectionFilter} onChange={(e) => setCollectionFilter(e.target.value)} className="sm:w-48">
          <option value="all">All Collections</option>
          <option value="legacy">Legacy</option>
          <option value="reserve">Reserve</option>
          <option value="royale">Royale</option>
          <option value="elite">Elite</option>
          <option value="noir">Noir</option>
        </Select>
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-overlay/40">{selectedIds.length} selected</span>
            <Button variant="secondary" size="sm" onClick={handleBulkDeactivateStock}>
              Mark Out of Stock
            </Button>
            <Button
              size="sm"
              onClick={handleBulkDelete}
              className="bg-red-500/90 text-white hover:bg-red-500"
            >
              <Trash2 size={13} /> Delete Selected
            </Button>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        getRowId={(p) => p.id}
        selectable
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        emptyMessage={loading ? "Loading products…" : storeError ? storeError : "No products match your filters."}
      />

      <Modal open={importOpen} onClose={() => setImportOpen(false)}>
        <h3 className="mb-2 font-serif text-xl text-fg">Import Products via CSV</h3>
        <p className="mb-4 text-sm text-overlay/50">
          Paste rows in the format: <code className="text-gold">name,collection,price,stock</code> — one
          per line. Collection must be one of legacy, reserve, royale, elite, noir.
        </p>
        <Textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={"Midnight Oud,noir,320,25\nGolden Hour,royale,275,40"}
          className="min-h-40 font-mono text-xs"
        />
        <Button className="mt-4 w-full" onClick={handleImport} disabled={!csvText.trim()}>
          Import Rows
        </Button>
      </Modal>
    </div>
  );
}

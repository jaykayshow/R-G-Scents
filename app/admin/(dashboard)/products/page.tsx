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
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { Product, ProductVariant } from "@/types";
import { formatCurrency } from "@/lib/utils";

export default function AdminProductsPage() {
  const products = useProductsStore((s) => s.products);
  const deleteProducts = useProductsStore((s) => s.deleteProducts);
  const bulkUpdate = useProductsStore((s) => s.bulkUpdate);
  const addProduct = useProductsStore((s) => s.addProduct);
  const log = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

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

  function actor() {
    return currentAdmin?.name ?? "Admin";
  }

  function handleBulkDelete() {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected product(s)? This cannot be undone.`)) return;
    deleteProducts(selectedIds);
    log({ actor: actor(), action: `Bulk deleted ${selectedIds.length} product(s)`, target: selectedIds.join(", "), category: "Product" });
    showToast(`${selectedIds.length} product(s) deleted.`);
    setSelectedIds([]);
  }

  function handleBulkDeactivateStock() {
    if (selectedIds.length === 0) return;
    selectedIds.forEach((id) => {
      const product = products.find((p) => p.id === id);
      if (!product) return;
      bulkUpdate([id], { variants: product.variants.map((v) => ({ ...v, stock: 0 })) });
    });
    log({ actor: actor(), action: `Bulk marked ${selectedIds.length} product(s) out of stock`, target: selectedIds.join(", "), category: "Product" });
    showToast(`${selectedIds.length} product(s) marked out of stock.`);
    setSelectedIds([]);
  }

  function handleImport() {
    const lines = csvText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    let imported = 0;
    lines.forEach((line) => {
      const [name, collection, priceStr, stockStr] = line.split(",").map((s) => s.trim());
      if (!name || !collection || !priceStr) return;
      const price = Number(priceStr) || 0;
      const stock = Number(stockStr) || 0;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const id = `p-${slug}-${Date.now()}-${imported}`;
      const variant: ProductVariant = {
        id: `v-${slug}-50-${Date.now()}-${imported}`,
        size: "50ml",
        sku: `RG-${slug.slice(0, 3).toUpperCase()}-50`,
        barcode: String(Date.now()).slice(-10),
        price,
        stock,
      };
      const newProduct: Product = {
        id,
        slug: `${slug}-${imported}`,
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
      addProduct(newProduct);
      imported += 1;
    });
    log({ actor: actor(), action: `Imported ${imported} product(s) via CSV`, target: "Bulk Import", category: "Product" });
    showToast(`Imported ${imported} product(s) from CSV.`);
    setCsvText("");
    setImportOpen(false);
  }

  function handleDeleteOne(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteProducts([id]);
    log({ actor: actor(), action: "Deleted product", target: name, category: "Product" });
    showToast(`${name} deleted.`);
  }

  const columns: DataTableColumn<Product>[] = [
    {
      key: "product",
      label: "Product",
      sortValue: (p) => p.name,
      render: (p) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sm bg-white/5">
            <Image src={p.images[0]} alt={p.name} fill className="object-contain p-1" />
          </div>
          <div>
            <Link href={`/admin/products/${p.id}`} className="font-medium text-brand-white hover:text-gold">
              {p.name}
            </Link>
            <p className="text-xs capitalize text-white/40">{p.collection}</p>
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
        <span className={p.stock === 0 ? "text-red-400" : p.stock <= 15 ? "text-amber-400" : "text-white/80"}>
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
            className="text-xs text-white/40 hover:text-red-300"
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
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full rounded-sm border border-white/15 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-brand-white placeholder:text-white/30 focus:border-gold focus:outline-none"
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
            <span className="text-xs text-white/40">{selectedIds.length} selected</span>
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
        emptyMessage="No products match your filters."
      />

      <Modal open={importOpen} onClose={() => setImportOpen(false)}>
        <h3 className="mb-2 font-serif text-xl text-brand-white">Import Products via CSV</h3>
        <p className="mb-4 text-sm text-white/50">
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

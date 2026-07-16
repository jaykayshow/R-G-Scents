"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, History, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useProductsStore } from "@/lib/store/products-store";
import { useInventoryHistoryStore } from "@/lib/store/inventory-history-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { formatDate } from "@/lib/utils";

const LOW_STOCK_THRESHOLD = 15;

interface VariantRow {
  productId: string;
  productName: string;
  variantId: string;
  size: string;
  sku: string;
  barcode: string;
  stock: number;
}

export default function InventoryPage() {
  const products = useProductsStore((s) => s.products);
  const setVariantStock = useProductsStore((s) => s.setVariantStock);
  const history = useInventoryHistoryStore((s) => s.history);
  const logInventory = useInventoryHistoryStore((s) => s.log);
  const logAudit = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<"stock" | "history">("stock");
  const [editingVariant, setEditingVariant] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const rows: VariantRow[] = useMemo(
    () =>
      products.flatMap((p) =>
        p.variants.map((v) => ({
          productId: p.id,
          productName: p.name,
          variantId: v.id,
          size: v.size,
          sku: v.sku,
          barcode: v.barcode,
          stock: v.stock,
        }))
      ),
    [products]
  );

  const filteredRows = rows.filter(
    (r) =>
      !query.trim() ||
      r.productName.toLowerCase().includes(query.toLowerCase()) ||
      r.sku.toLowerCase().includes(query.toLowerCase())
  );

  const lowStockRows = rows.filter((r) => r.stock > 0 && r.stock <= LOW_STOCK_THRESHOLD);
  const outOfStockRows = rows.filter((r) => r.stock === 0);

  function startEdit(row: VariantRow) {
    setEditingVariant(row.variantId);
    setEditValue(String(row.stock));
  }

  function saveEdit(row: VariantRow) {
    const newStock = Math.max(0, Number(editValue) || 0);
    if (newStock === row.stock) {
      setEditingVariant(null);
      return;
    }
    setVariantStock(row.productId, row.variantId, newStock);
    logInventory({
      productId: row.productId,
      productName: row.productName,
      variantId: row.variantId,
      variantSize: row.size,
      sku: row.sku,
      change: newStock - row.stock,
      previousStock: row.stock,
      newStock,
      reason: "Manual adjustment",
      actor: currentAdmin?.name ?? "Admin",
    });
    logAudit({
      actor: currentAdmin?.name ?? "Admin",
      action: "Updated stock",
      target: `${row.productName} — ${row.size} (${row.sku})`,
      category: "Inventory",
    });
    showToast(`${row.productName} (${row.size}) stock updated to ${newStock}.`);
    setEditingVariant(null);
  }

  const stockColumns: DataTableColumn<VariantRow>[] = [
    { key: "product", label: "Product", sortValue: (r) => r.productName, render: (r) => (
      <span className="font-medium text-fg">{r.productName}</span>
    ) },
    { key: "size", label: "Variant", render: (r) => r.size },
    { key: "sku", label: "SKU", render: (r) => <span className="font-mono text-xs">{r.sku}</span> },
    { key: "barcode", label: "Barcode", render: (r) => <span className="font-mono text-xs text-overlay/40">{r.barcode}</span> },
    {
      key: "stock",
      label: "Stock",
      sortValue: (r) => r.stock,
      render: (r) =>
        editingVariant === r.variantId ? (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="!w-24 !py-1"
              autoFocus
            />
            <Button size="sm" onClick={() => saveEdit(r)}>Save</Button>
            <Button size="sm" variant="secondary" onClick={() => setEditingVariant(null)}>Cancel</Button>
          </div>
        ) : (
          <button onClick={() => startEdit(r)} className="text-left hover:text-gold">
            <span className={r.stock === 0 ? "text-red-400" : r.stock <= LOW_STOCK_THRESHOLD ? "text-amber-400" : "text-overlay/80"}>
              {r.stock} units
            </span>
          </button>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (r) => (
        <Badge variant={r.stock === 0 ? "danger" : r.stock <= LOW_STOCK_THRESHOLD ? "outline" : "gold"}>
          {r.stock === 0 ? "Out of Stock" : r.stock <= LOW_STOCK_THRESHOLD ? "Low Stock" : "In Stock"}
        </Badge>
      ),
    },
  ];

  const historyColumns: DataTableColumn<(typeof history)[number]>[] = [
    { key: "date", label: "Date", sortValue: (h) => h.date, render: (h) => formatDate(h.date) },
    { key: "product", label: "Product / Variant", render: (h) => `${h.productName} — ${h.variantSize}` },
    { key: "sku", label: "SKU", render: (h) => <span className="font-mono text-xs">{h.sku}</span> },
    {
      key: "change",
      label: "Change",
      render: (h) => (
        <span className={h.change >= 0 ? "text-emerald-400" : "text-red-400"}>
          {h.change >= 0 ? "+" : ""}
          {h.change}
        </span>
      ),
    },
    { key: "resulting", label: "Resulting Stock", render: (h) => h.newStock },
    { key: "reason", label: "Reason", render: (h) => h.reason },
    { key: "actor", label: "By", render: (h) => h.actor },
  ];

  return (
    <div>
      <AdminPageHeader title="Inventory" description="Real-time stock levels across every SKU." />

      {(lowStockRows.length > 0 || outOfStockRows.length > 0) && (
        <div className="mb-6 flex items-start gap-3 rounded-md border border-amber-400/30 bg-amber-400/5 p-4 text-sm text-amber-300">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <p>
            {outOfStockRows.length > 0 && <strong>{outOfStockRows.length} variant(s) out of stock. </strong>}
            {lowStockRows.length > 0 && `${lowStockRows.length} variant(s) at or below the ${LOW_STOCK_THRESHOLD}-unit low-stock threshold.`}
          </p>
        </div>
      )}

      <div className="mb-4 flex items-center gap-2 border-b border-overlay/10">
        <button
          onClick={() => setTab("stock")}
          className={`border-b-2 px-1 pb-3 text-sm font-medium ${tab === "stock" ? "border-gold text-gold" : "border-transparent text-overlay/50"}`}
        >
          Stock Levels
        </button>
        <button
          onClick={() => setTab("history")}
          className={`flex items-center gap-1.5 border-b-2 px-1 pb-3 text-sm font-medium ${tab === "history" ? "border-gold text-gold" : "border-transparent text-overlay/50"}`}
        >
          <History size={13} /> History Log
        </button>
      </div>

      {tab === "stock" ? (
        <>
          <div className="relative mb-4 max-w-sm">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-overlay/30" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by product or SKU..."
              className="w-full rounded-sm border border-overlay/15 bg-overlay/[0.03] py-2 pl-9 pr-3 text-sm text-fg placeholder:text-overlay/30 focus:border-gold focus:outline-none"
            />
          </div>
          <DataTable columns={stockColumns} rows={filteredRows} getRowId={(r) => r.variantId} />
        </>
      ) : (
        <DataTable columns={historyColumns} rows={history} getRowId={(h) => h.id} emptyMessage="No inventory changes yet." />
      )}
    </div>
  );
}

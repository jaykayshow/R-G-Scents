"use client";

import { useMemo, useState } from "react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { AuditLogEntry } from "@/types";
import { formatDate } from "@/lib/utils";

const categories: AuditLogEntry["category"][] = [
  "Product",
  "Order",
  "Coupon",
  "Review",
  "Blog",
  "Banner",
  "User",
  "Settings",
  "Inventory",
  "Customer",
];

const categoryVariant = (category: AuditLogEntry["category"]) => {
  if (category === "User" || category === "Settings") return "danger";
  if (category === "Order" || category === "Inventory") return "gold";
  return "outline";
};

export default function AdminLogsPage() {
  const logs = useAuditLogStore((s) => s.logs);
  const [categoryFilter, setCategoryFilter] = useState<"all" | AuditLogEntry["category"]>("all");

  const filtered = useMemo(
    () => (categoryFilter === "all" ? logs : logs.filter((l) => l.category === categoryFilter)),
    [logs, categoryFilter]
  );

  const columns: DataTableColumn<AuditLogEntry>[] = [
    { key: "date", label: "Timestamp", sortValue: (l) => l.date, render: (l) => formatDate(l.date) },
    { key: "actor", label: "Actor", render: (l) => <span className="font-medium text-brand-white">{l.actor}</span> },
    { key: "action", label: "Action", render: (l) => l.action },
    { key: "target", label: "Target", render: (l) => <span className="text-white/60">{l.target}</span> },
    { key: "category", label: "Category", render: (l) => <Badge variant={categoryVariant(l.category)}>{l.category}</Badge> },
  ];

  return (
    <div>
      <AdminPageHeader title="System Logs" description={`${logs.length} recorded admin actions`} />

      <div className="mb-4">
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as never)} className="w-48">
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <DataTable columns={columns} rows={filtered} getRowId={(l) => l.id} emptyMessage="No log entries yet." />
    </div>
  );
}

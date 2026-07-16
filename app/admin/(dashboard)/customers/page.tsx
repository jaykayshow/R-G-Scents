"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { useCustomersStore } from "@/lib/store/customers-store";
import { Customer } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminCustomersPage() {
  const customers = useCustomersStore((s) => s.customers);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Customer["status"]>("all");

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!c.name.toLowerCase().includes(q) && !c.email.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [customers, query, statusFilter]);

  const columns: DataTableColumn<Customer>[] = [
    {
      key: "name",
      label: "Customer",
      sortValue: (c) => c.name,
      render: (c) => (
        <Link href={`/admin/customers/${c.id}`} className="font-medium text-brand-white hover:text-gold">
          {c.name}
        </Link>
      ),
    },
    { key: "email", label: "Email", render: (c) => <span className="text-white/60">{c.email}</span> },
    { key: "joined", label: "Joined", sortValue: (c) => c.joinedAt, render: (c) => formatDate(c.joinedAt) },
    { key: "orders", label: "Orders", sortValue: (c) => c.ordersCount, render: (c) => c.ordersCount },
    { key: "spent", label: "Total Spent", sortValue: (c) => c.totalSpent, render: (c) => formatCurrency(c.totalSpent) },
    {
      key: "status",
      label: "Status",
      render: (c) => <Badge variant={c.status === "Active" ? "gold" : "danger"}>{c.status}</Badge>,
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Customers" description={`${customers.length} registered customers`} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-sm border border-white/15 bg-white/[0.03] py-2 pl-9 pr-3 text-sm text-brand-white placeholder:text-white/30 focus:border-gold focus:outline-none"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as never)} className="sm:w-44">
          <option value="all">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </Select>
      </div>

      <DataTable columns={columns} rows={filtered} getRowId={(c) => c.id} emptyMessage="No customers match your filters." />
    </div>
  );
}

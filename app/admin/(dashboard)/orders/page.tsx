"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { useOrdersStore } from "@/lib/store/orders-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { Order, OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const orderStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

const statusVariant = (status: OrderStatus) =>
  status === "Delivered" ? "gold" : status === "Cancelled" || status === "Refunded" ? "danger" : "outline";

export default function AdminOrdersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const updateStatus = useOrdersStore((s) => s.updateStatus);
  const log = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (query.trim() && !o.orderNumber.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [orders, query, statusFilter]);

  function handleStatusChange(orderNumber: string, status: OrderStatus) {
    updateStatus(orderNumber, status);
    log({
      actor: currentAdmin?.name ?? "Admin",
      action: `Changed order status to ${status}`,
      target: orderNumber,
      category: "Order",
    });
    showToast(`Order ${orderNumber} marked as ${status}.`);
  }

  const columns: DataTableColumn<Order>[] = [
    {
      key: "order",
      label: "Order",
      sortValue: (o) => o.orderNumber,
      render: (o) => (
        <Link href={`/admin/orders/${o.orderNumber}`} className="font-medium text-fg hover:text-gold">
          {o.orderNumber}
        </Link>
      ),
    },
    { key: "date", label: "Date", sortValue: (o) => o.date, render: (o) => formatDate(o.date) },
    { key: "items", label: "Items", render: (o) => `${o.items.length} item(s)` },
    { key: "customer", label: "Ship To", render: (o) => o.shippingAddress.fullName },
    { key: "total", label: "Total", sortValue: (o) => o.total, render: (o) => formatCurrency(o.total) },
    {
      key: "status",
      label: "Status",
      render: (o) => (
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
          <Select
            value={o.status}
            onChange={(e) => handleStatusChange(o.orderNumber, e.target.value as OrderStatus)}
            className="!w-36 !py-1.5 !text-xs"
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title="Orders" description={`${orders.length} total orders`} />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-overlay/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search order number..."
            className="w-full rounded-sm border border-overlay/15 bg-overlay/[0.03] py-2 pl-9 pr-3 text-sm text-fg placeholder:text-overlay/30 focus:border-gold focus:outline-none"
          />
        </div>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as never)} className="sm:w-48">
          <option value="all">All Statuses</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </Select>
      </div>

      <DataTable columns={columns} rows={filtered} getRowId={(o) => o.id} emptyMessage="No orders match your filters." />
    </div>
  );
}

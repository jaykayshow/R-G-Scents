"use client";

import Link from "next/link";
import { useEffect } from "react";
import { DollarSign, ShoppingCart, Receipt, AlertTriangle, LifeBuoy, ArrowRight } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { AdminPageHeader } from "@/components/admin/page-header";
import { RevenueTrendChart } from "@/components/admin/charts/revenue-trend-chart";
import { TopProductsChart } from "@/components/admin/charts/top-products-chart";
import { Select } from "@/components/ui/input";
import { useOrdersStore } from "@/lib/store/orders-store";
import { useProductsStore } from "@/lib/store/products-store";
import { useSupportStore } from "@/lib/store/support-store";
import { useToastStore } from "@/lib/store/toast-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useAnalyticsStore } from "@/lib/store/analytics-store";
import { ApiError } from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderStatus } from "@/types";

const LOW_STOCK_THRESHOLD = 15;
const orderStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

export default function AdminDashboardPage() {
  const orders = useOrdersStore((s) => s.orders);
  const fetchAllForAdmin = useOrdersStore((s) => s.fetchAllForAdmin);
  const updateOrderStatus = useOrdersStore((s) => s.updateStatus);
  const products = useProductsStore((s) => s.products);
  const tickets = useSupportStore((s) => s.tickets);
  const showToast = useToastStore((s) => s.show);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const overview = useAnalyticsStore((s) => s.overview);
  const fetchOverview = useAnalyticsStore((s) => s.fetchOverview);

  useEffect(() => {
    fetchAllForAdmin();
    fetchOverview();
  }, [fetchAllForAdmin, fetchOverview]);

  const today = overview?.dailyMetrics[overview.dailyMetrics.length - 1];
  const lowStockVariants = products.flatMap((p) =>
    p.variants.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK_THRESHOLD).map((v) => ({ product: p, variant: v }))
  );
  const pendingTickets = tickets.filter((t) => t.status !== "Resolved");
  const recentOrders = [...orders]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 6);

  async function handleStatusChange(orderNumber: string, status: OrderStatus) {
    try {
      await updateOrderStatus(orderNumber, status);
      showToast(`Order ${orderNumber} marked as ${status}.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not update order status.", "error");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={`Welcome back, ${currentAdmin?.name.split(" ")[0] ?? ""}`}
        description="Here's what's happening across R&G Scents today."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label="Revenue (30d)"
          value={formatCurrency(overview?.totals.revenue ?? 0)}
          icon={DollarSign}
          trend={overview ? { value: overview.revenueTrendVsPreviousPeriod } : undefined}
        />
        <StatCard
          label="Orders Today"
          value={String(today?.orders ?? 0)}
          icon={ShoppingCart}
          trend={overview ? { value: overview.ordersTrendVsPreviousPeriod, label: "vs prior period" } : undefined}
        />
        <StatCard label="Avg. Order Value" value={formatCurrency(overview?.averageOrderValue ?? 0)} icon={Receipt} tone="neutral" />
        <StatCard
          label="Low Stock Items"
          value={String(lowStockVariants.length)}
          icon={AlertTriangle}
          tone={lowStockVariants.length > 0 ? "danger" : "neutral"}
        />
        <StatCard
          label="Pending Tickets"
          value={String(pendingTickets.length)}
          icon={LifeBuoy}
          tone={pendingTickets.length > 0 ? "danger" : "neutral"}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5 lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">
            Revenue Trend (30 Days)
          </h2>
          <RevenueTrendChart data={overview?.dailyMetrics ?? []} />
        </div>
        <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">
            Top Selling Products
          </h2>
          {overview && overview.topProducts.length > 0 ? (
            <TopProductsChart data={overview.topProducts} />
          ) : (
            <p className="py-8 text-center text-sm text-overlay/40">No product sales in this period yet.</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-overlay/50">Recent Orders</h2>
          <Link href="/admin/orders" className="flex items-center gap-1 text-xs text-gold hover:underline">
            View All <ArrowRight size={12} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-overlay/10 text-xs uppercase tracking-wider text-overlay/40">
                <th className="px-3 py-2 font-semibold">Order</th>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Total</th>
                <th className="px-3 py-2 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-overlay/5">
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="px-3 py-3">
                    <Link href={`/admin/orders/${order.orderNumber}`} className="text-fg hover:text-gold">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-overlay/60">{formatDate(order.date)}</td>
                  <td className="px-3 py-3 text-overlay/80">{formatCurrency(order.total)}</td>
                  <td className="px-3 py-3">
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.orderNumber, e.target.value as OrderStatus)}
                      className="!w-40 !py-1.5 !text-xs"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

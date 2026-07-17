"use client";

import { useEffect } from "react";
import { Download, DollarSign, ShoppingCart, Receipt, Users as UsersIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueTrendChart } from "@/components/admin/charts/revenue-trend-chart";
import { TopProductsChart } from "@/components/admin/charts/top-products-chart";
import { Button } from "@/components/ui/button";
import { useAnalyticsStore, weeklyMetrics } from "@/lib/store/analytics-store";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  const overview = useAnalyticsStore((s) => s.overview);
  const loading = useAnalyticsStore((s) => s.loading);
  const fetchOverview = useAnalyticsStore((s) => s.fetchOverview);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  function handleExport() {
    if (!overview) return;
    const lines = [
      "Date,Revenue,Orders",
      ...overview.dailyMetrics.map((d) => `${d.date},${d.revenue},${d.orders}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rg-scents-revenue-report-${overview.dailyMetrics[overview.dailyMetrics.length - 1].date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!overview) {
    return (
      <div>
        <AdminPageHeader
          title="Analytics"
          description="Sales performance and top products over the last 30 days."
        />
        <p className="py-12 text-center text-sm text-overlay/40">
          {loading ? "Loading analytics…" : "No analytics data available yet."}
        </p>
      </div>
    );
  }

  const weeks = weeklyMetrics(overview);

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Sales performance and top products over the last 30 days, computed from real orders."
        actions={
          <Button size="sm" variant="secondary" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue (30d)" value={formatCurrency(overview.totals.revenue)} icon={DollarSign} trend={{ value: overview.revenueTrendVsPreviousPeriod }} />
        <StatCard label="Total Orders (30d)" value={overview.totals.orders.toLocaleString()} icon={ShoppingCart} trend={{ value: overview.ordersTrendVsPreviousPeriod }} />
        <StatCard label="Avg. Order Value" value={formatCurrency(overview.averageOrderValue)} icon={Receipt} tone="neutral" />
        <StatCard label="Total Customers" value={overview.totalCustomers.toLocaleString()} icon={UsersIcon} tone="neutral" />
      </div>

      <div className="mt-6 rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Revenue &amp; Orders Trend</h2>
        <RevenueTrendChart data={overview.dailyMetrics} height={320} />
      </div>

      <div className="mt-6 rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Top Products by Revenue</h2>
        {overview.topProducts.length === 0 ? (
          <p className="py-8 text-center text-sm text-overlay/40">No product sales in this period yet.</p>
        ) : (
          <TopProductsChart data={overview.topProducts} height={280} />
        )}
      </div>

      <div className="mt-6 rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Weekly Breakdown</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-overlay/10 text-xs uppercase tracking-wider text-overlay/40">
              <th className="py-2 font-semibold">Week</th>
              <th className="py-2 font-semibold">Revenue</th>
              <th className="py-2 font-semibold">Orders</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-overlay/5">
            {weeks.map((week) => (
              <tr key={week.week}>
                <td className="py-3 text-overlay/70">{week.week}</td>
                <td className="py-3 text-fg">{formatCurrency(week.revenue)}</td>
                <td className="py-3 text-overlay/70">{week.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-overlay/30">
        Data reflects real orders over the 30-day period ending {formatDate(overview.dailyMetrics[overview.dailyMetrics.length - 1].date)}.
      </p>
    </div>
  );
}

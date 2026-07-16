"use client";

import { Download, DollarSign, ShoppingCart, Percent, Users as UsersIcon } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { StatCard } from "@/components/admin/stat-card";
import { RevenueTrendChart } from "@/components/admin/charts/revenue-trend-chart";
import { TopProductsChart } from "@/components/admin/charts/top-products-chart";
import { TrafficSourcesChart } from "@/components/admin/charts/traffic-sources-chart";
import { Button } from "@/components/ui/button";
import {
  dailyMetrics,
  weeklyMetrics,
  topProducts,
  trafficSources,
  totals,
  conversionRate,
  revenueTrendVsPreviousPeriod,
  ordersTrendVsPreviousPeriod,
} from "@/lib/mock-data/analytics";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminAnalyticsPage() {
  function handleExport() {
    const lines = [
      "Date,Revenue,Orders,Visitors",
      ...dailyMetrics.map((d) => `${d.date},${d.revenue},${d.orders},${d.visitors}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rg-scents-revenue-report-${dailyMetrics[dailyMetrics.length - 1].date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        description="Sales performance, top products, and traffic sources over the last 30 days."
        actions={
          <Button size="sm" variant="secondary" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(totals.revenue)} icon={DollarSign} trend={{ value: revenueTrendVsPreviousPeriod() }} />
        <StatCard label="Total Orders" value={totals.orders.toLocaleString()} icon={ShoppingCart} trend={{ value: ordersTrendVsPreviousPeriod() }} />
        <StatCard label="Conversion Rate" value={`${conversionRate}%`} icon={Percent} tone="neutral" />
        <StatCard label="Total Visitors" value={totals.visitors.toLocaleString()} icon={UsersIcon} tone="neutral" />
      </div>

      <div className="mt-6 rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Revenue &amp; Orders Trend</h2>
        <RevenueTrendChart data={dailyMetrics} height={320} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Top Products by Revenue</h2>
          <TopProductsChart data={topProducts} height={280} />
        </div>
        <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Traffic Sources</h2>
          <TrafficSourcesChart data={trafficSources} height={280} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
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
              {weeklyMetrics().map((week) => (
                <tr key={week.week}>
                  <td className="py-3 text-overlay/70">{week.week}</td>
                  <td className="py-3 text-fg">{formatCurrency(week.revenue)}</td>
                  <td className="py-3 text-overlay/70">{week.orders}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Traffic Source Detail</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-overlay/10 text-xs uppercase tracking-wider text-overlay/40">
                <th className="py-2 font-semibold">Source</th>
                <th className="py-2 font-semibold">Sessions</th>
                <th className="py-2 font-semibold">Conv. Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-overlay/5">
              {trafficSources.map((source) => (
                <tr key={source.source}>
                  <td className="py-3 text-overlay/70">{source.source}</td>
                  <td className="py-3 text-fg">{source.sessions.toLocaleString()}</td>
                  <td className="py-3 text-overlay/70">{source.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-6 text-xs text-overlay/30">
        Data reflects the 30-day period ending {formatDate(dailyMetrics[dailyMetrics.length - 1].date)}.
      </p>
    </div>
  );
}

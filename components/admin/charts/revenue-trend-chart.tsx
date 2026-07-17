"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AnalyticsDailyMetric } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const gridStroke = "color-mix(in oklab, var(--color-overlay) 6%, transparent)";
const axisStroke = "color-mix(in oklab, var(--color-overlay) 30%, transparent)";
const labelColor = "color-mix(in oklab, var(--color-fg) 60%, transparent)";
const tooltipBorder = "1px solid color-mix(in oklab, var(--color-overlay) 10%, transparent)";

export function RevenueTrendChart({ data, height = 280 }: { data: AnalyticsDailyMetric[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a24b" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#c9a24b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => d.slice(5)}
          stroke={axisStroke}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          stroke={axisStroke}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v / 1000}k`}
          width={44}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: tooltipBorder,
            borderRadius: 4,
            fontSize: 12,
            color: "var(--color-fg)",
          }}
          labelStyle={{ color: labelColor }}
          formatter={(value, name) => [
            name === "revenue" ? formatCurrency(Number(value)) : String(value),
            name === "revenue" ? "Revenue" : "Orders",
          ]}
        />
        <Area type="monotone" dataKey="revenue" stroke="#c9a24b" strokeWidth={2} fill="url(#revenueFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

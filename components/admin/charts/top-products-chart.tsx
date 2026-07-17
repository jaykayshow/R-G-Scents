"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { AnalyticsTopProduct } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#c9a24b", "#e6cd8a", "#8a6d2f", "#efe3c3", "#5b4a24"];
const gridStroke = "color-mix(in oklab, var(--color-overlay) 6%, transparent)";
const axisStroke = "color-mix(in oklab, var(--color-overlay) 30%, transparent)";
const axisStrokeStrong = "color-mix(in oklab, var(--color-overlay) 50%, transparent)";
const tooltipBorder = "1px solid color-mix(in oklab, var(--color-overlay) 10%, transparent)";

export function TopProductsChart({ data, height = 260 }: { data: AnalyticsTopProduct[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} horizontal={false} />
        <XAxis
          type="number"
          stroke={axisStroke}
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v / 1000}k`}
        />
        <YAxis
          type="category"
          dataKey="productName"
          stroke={axisStrokeStrong}
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={64}
        />
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: tooltipBorder,
            borderRadius: 4,
            fontSize: 12,
            color: "var(--color-fg)",
          }}
          formatter={(value) => [formatCurrency(Number(value)), "Revenue"]}
        />
        <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

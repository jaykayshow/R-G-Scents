"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TopProductMetric } from "@/lib/mock-data/analytics";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#c9a24b", "#e6cd8a", "#8a6d2f", "#efe3c3", "#5b4a24"];

export function TopProductsChart({ data, height = 260 }: { data: TopProductMetric[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
        <XAxis
          type="number"
          stroke="rgba(255,255,255,0.3)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v / 1000}k`}
        />
        <YAxis
          type="category"
          dataKey="productName"
          stroke="rgba(255,255,255,0.5)"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          width={64}
        />
        <Tooltip
          contentStyle={{
            background: "#15161a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            fontSize: 12,
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

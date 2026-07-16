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
import { DailyMetric } from "@/lib/mock-data/analytics";
import { formatCurrency } from "@/lib/utils";

export function RevenueTrendChart({ data, height = 280 }: { data: DailyMetric[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9a24b" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#c9a24b" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(d: string) => d.slice(5)}
          stroke="rgba(255,255,255,0.3)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          stroke="rgba(255,255,255,0.3)"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `$${v / 1000}k`}
          width={44}
        />
        <Tooltip
          contentStyle={{
            background: "#15161a",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 4,
            fontSize: 12,
          }}
          labelStyle={{ color: "rgba(255,255,255,0.6)" }}
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

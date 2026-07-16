"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrafficSource } from "@/lib/mock-data/analytics";

const COLORS = ["#c9a24b", "#e6cd8a", "#8a6d2f", "#efe3c3", "#5b4a24", "#9c7f3f"];
const tooltipBorder = "1px solid color-mix(in oklab, var(--color-overlay) 10%, transparent)";
const legendColor = "color-mix(in oklab, var(--color-fg) 60%, transparent)";

export function TrafficSourcesChart({ data, height = 280 }: { data: TrafficSource[]; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey="sessions"
          nameKey="source"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--color-bg)" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            background: "var(--color-surface)",
            border: tooltipBorder,
            borderRadius: 4,
            fontSize: 12,
            color: "var(--color-fg)",
          }}
          formatter={(value) => [Number(value).toLocaleString(), "Sessions"]}
        />
        <Legend
          layout="vertical"
          align="right"
          verticalAlign="middle"
          wrapperStyle={{ fontSize: 11, color: legendColor }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

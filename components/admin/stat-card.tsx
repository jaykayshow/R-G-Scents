import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "gold",
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: { value: number; label?: string };
  tone?: "gold" | "danger" | "neutral";
}) {
  const toneClasses = {
    gold: "border-gold/30 text-gold bg-gold/10",
    danger: "border-red-400/30 text-red-300 bg-red-400/10",
    neutral: "border-overlay/15 text-overlay/70 bg-overlay/5",
  };

  return (
    <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-overlay/40">{label}</p>
          <p className="mt-2 font-serif text-2xl text-fg sm:text-3xl">{value}</p>
        </div>
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md border", toneClasses[tone])}>
          <Icon size={18} />
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          {trend.value >= 0 ? (
            <TrendingUp size={13} className="text-emerald-400" />
          ) : (
            <TrendingDown size={13} className="text-red-400" />
          )}
          <span className={trend.value >= 0 ? "text-emerald-400" : "text-red-400"}>
            {trend.value >= 0 ? "+" : ""}
            {trend.value}%
          </span>
          <span className="text-overlay/30">{trend.label ?? "vs last period"}</span>
        </div>
      )}
    </div>
  );
}

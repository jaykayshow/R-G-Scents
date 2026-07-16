import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "gold",
  className,
}: {
  children: React.ReactNode;
  variant?: "gold" | "outline" | "danger";
  className?: string;
}) {
  const variants = {
    gold: "bg-gold text-matte-black",
    outline: "border border-gold/60 text-gold",
    danger: "bg-red-500/20 text-red-300 border border-red-400/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

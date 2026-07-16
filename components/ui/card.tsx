import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-md border border-overlay/10 bg-overlay/[0.03] backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

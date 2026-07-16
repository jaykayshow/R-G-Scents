import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Contact", "Shipping", "Payment", "Review"];

export function CheckoutSteps({ current }: { current: number }) {
  return (
    <div className="mb-12 flex items-center justify-between">
      {steps.map((step, i) => (
        <div key={step} className="flex flex-1 flex-col items-center text-center">
          <div className="flex w-full items-center">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs transition-colors",
                i < current
                  ? "border-gold bg-gold text-ink"
                  : i === current
                  ? "border-gold text-gold"
                  : "border-overlay/20 text-overlay/40"
              )}
            >
              {i < current ? <Check size={14} /> : i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className={cn("h-0.5 flex-1", i < current ? "bg-gold" : "bg-overlay/15")} />
            )}
          </div>
          <p className={cn("mt-2 text-[11px] uppercase tracking-widest", i <= current ? "text-fg" : "text-overlay/40")}>
            {step}
          </p>
        </div>
      ))}
    </div>
  );
}

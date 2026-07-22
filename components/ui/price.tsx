import { formatCurrency, cn } from "@/lib/utils";
import { useCurrencyStore } from "@/lib/store/currency-store";

interface PriceProps {
  amount: number;
  className?: string;
  estimateClassName?: string;
}

/**
 * Renders the real Naira price, plus a smaller "≈ $X" estimate for visitors
 * outside Nigeria (converted client-side from live FX rates — never the
 * amount actually charged, which is always the Naira figure).
 */
export function Price({ amount, className, estimateClassName }: PriceProps) {
  const detectedCurrency = useCurrencyStore((s) => s.detectedCurrency);
  const rates = useCurrencyStore((s) => s.rates);
  const rate = detectedCurrency && rates ? rates[detectedCurrency] : undefined;

  return (
    <span className={className}>
      {formatCurrency(amount, "NGN")}
      {rate !== undefined && detectedCurrency && (
        <span className={cn("ml-1.5 text-xs text-overlay/40", estimateClassName)}>
          (≈ {formatCurrency(amount * rate, detectedCurrency)})
        </span>
      )}
    </span>
  );
}

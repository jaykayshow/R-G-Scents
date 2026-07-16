"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QuantityInput({
  quantity,
  onChange,
  max = 99,
  min = 1,
  className,
}: {
  quantity: number;
  onChange: (quantity: number) => void;
  max?: number;
  min?: number;
  className?: string;
}) {
  return (
    <div className={cn("inline-flex items-center border border-white/15 rounded-sm", className)}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        aria-label="Decrease quantity"
        className="flex h-10 w-10 items-center justify-center text-white/70 transition-colors hover:text-gold disabled:opacity-30"
      >
        <Minus size={15} />
      </button>
      <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        aria-label="Increase quantity"
        className="flex h-10 w-10 items-center justify-center text-white/70 transition-colors hover:text-gold disabled:opacity-30"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

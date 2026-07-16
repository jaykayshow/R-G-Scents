import { InputHTMLAttributes, forwardRef, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const baseFieldClasses =
  "w-full rounded-sm border border-overlay/15 bg-overlay/[0.03] px-4 py-3 text-sm text-fg placeholder:text-overlay/35 focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold transition-colors";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(baseFieldClasses, error && "border-red-400/70 focus:ring-red-400", className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(baseFieldClasses, "min-h-32 resize-y", error && "border-red-400/70 focus:ring-red-400", className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => (
    <div className="w-full">
      <select
        ref={ref}
        className={cn(baseFieldClasses, "cursor-pointer", error && "border-red-400/70 focus:ring-red-400", className)}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
);
Select.displayName = "Select";

export function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-semibold uppercase tracking-wider text-overlay/60">
      {children}
    </label>
  );
}

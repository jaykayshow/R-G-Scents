"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info } from "lucide-react";
import { useToastStore } from "@/lib/store/toast-store";

const icons = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const colors = {
  success: "border-gold/40 text-gold",
  error: "border-red-400/40 text-red-300",
  info: "border-white/25 text-white",
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-3">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.variant];
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              onClick={() => dismiss(toast.id)}
              className={`pointer-events-auto flex max-w-sm items-center gap-3 rounded-sm border bg-charcoal/95 px-4 py-3 text-sm shadow-xl backdrop-blur-sm cursor-pointer ${colors[toast.variant]}`}
            >
              <Icon size={18} className="shrink-0" />
              <span className="text-brand-white/90">{toast.message}</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

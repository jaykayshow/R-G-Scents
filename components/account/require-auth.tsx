"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { useOrdersStore } from "@/lib/store/orders-store";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const checked = useAuthStore((s) => s.checked);
  const fetchMine = useOrdersStore((s) => s.fetchMine);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (checked && !currentUser) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [checked, currentUser, router, pathname]);

  useEffect(() => {
    if (currentUser) fetchMine();
  }, [currentUser, fetchMine]);

  if (!checked || !currentUser) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-overlay/40">Loading account...</div>;
  }

  return <>{children}</>;
}

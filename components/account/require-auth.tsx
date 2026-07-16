"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !currentUser) {
      router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [hydrated, currentUser, router, pathname]);

  if (!hydrated || !currentUser) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-overlay/40">Loading account...</div>;
  }

  return <>{children}</>;
}

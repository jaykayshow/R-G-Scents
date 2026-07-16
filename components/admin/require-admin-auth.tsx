"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { sectionForPath } from "@/lib/admin-permissions";

export function RequireAdminAuth({ children }: { children: React.ReactNode }) {
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const showToast = useToastStore((s) => s.show);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (!hydrated) return;
    if (!currentAdmin) {
      router.replace("/admin/login");
      return;
    }
    const section = sectionForPath(pathname);
    if (section && !section.roles.includes(currentAdmin.role)) {
      showToast(`Your role (${currentAdmin.role}) does not have access to ${section.label}.`, "error");
      router.replace("/admin");
    }
  }, [hydrated, currentAdmin, pathname, router, showToast]);

  if (!hydrated || !currentAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090b] text-sm text-white/40">
        Loading admin console...
      </div>
    );
  }

  const section = sectionForPath(pathname);
  if (section && !section.roles.includes(currentAdmin.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08090b] text-sm text-white/40">
        Redirecting...
      </div>
    );
  }

  return <>{children}</>;
}

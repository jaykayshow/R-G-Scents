"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X, LogOut, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { getNavForRole } from "@/lib/admin-permissions";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const logout = useAdminAuthStore((s) => s.logout);
  const showToast = useToastStore((s) => s.show);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (!currentAdmin) return null;
  const navSections = getNavForRole(currentAdmin.role);

  function handleLogout() {
    logout();
    showToast("Signed out of admin console.", "info");
    router.push("/admin/login");
  }

  const sidebarContent = (
    <>
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-md border border-gold/40 bg-gold/10 font-serif text-sm text-gold">
          RG
        </div>
        <div>
          <p className="text-sm font-semibold text-fg">R&amp;G Admin</p>
          <p className="text-[10px] uppercase tracking-widest text-overlay/30">Console</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {navSections.map((section) => {
          const active = pathname === section.href || pathname.startsWith(`${section.href}/`);
          return (
            <Link
              key={section.key}
              href={section.href}
              onClick={() => setMobileNavOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-gold/15 text-gold"
                  : "text-overlay/60 hover:bg-overlay/5 hover:text-fg"
              )}
            >
              <section.icon size={16} />
              {section.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-overlay/10 p-4">
        <Link
          href="/"
          target="_blank"
          className="mb-2 flex items-center gap-2 rounded-sm px-3 py-2 text-xs text-overlay/50 hover:text-gold"
        >
          <ExternalLink size={13} /> View Storefront
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2 rounded-sm px-3 py-2 text-xs text-overlay/50 hover:text-red-300"
        >
          <LogOut size={13} /> Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-bg text-fg">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-overlay/10 bg-surface-2 md:flex">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileNavOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-overlay/10 bg-surface-2">
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-overlay/10 bg-bg/95 px-4 py-3 backdrop-blur-sm sm:px-6">
          <button
            onClick={() => setMobileNavOpen(true)}
            className="text-overlay/70 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <div className="hidden text-sm text-overlay/40 md:block">
            Signed in to the R&amp;G Scents internal console
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className="text-right">
              <p className="text-sm font-medium text-fg">{currentAdmin.name}</p>
              <p className="text-[10px] uppercase tracking-widest text-gold">{currentAdmin.role}</p>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gold/15 font-serif text-sm text-gold">
              {currentAdmin.name.charAt(0)}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      {mobileNavOpen && (
        <button
          onClick={() => setMobileNavOpen(false)}
          className="fixed right-4 top-4 z-50 text-white md:hidden"
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
      )}
    </div>
  );
}

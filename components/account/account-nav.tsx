"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  UserCog,
  Gift,
  Users,
  LifeBuoy,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/lib/store/toast-store";

const navItems = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/addresses", label: "Addresses", icon: MapPin },
  { href: "/account/payment-methods", label: "Payment Methods", icon: CreditCard },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/profile", label: "Profile & Password", icon: UserCog },
  { href: "/account/rewards", label: "Rewards", icon: Gift },
  { href: "/account/referrals", label: "Referrals", icon: Users },
  { href: "/account/support", label: "Support Tickets", icon: LifeBuoy },
];

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);
  const showToast = useToastStore((s) => s.show);

  function handleLogout() {
    logout();
    showToast("You've been signed out.", "info");
    router.push("/");
  }

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-sm px-4 py-2.5 text-sm transition-colors",
              active ? "bg-gold text-ink" : "text-overlay/60 hover:bg-overlay/5 hover:text-fg"
            )}
          >
            <item.icon size={16} /> {item.label}
          </Link>
        );
      })}
      <button
        onClick={handleLogout}
        className="flex w-full items-center gap-3 rounded-sm px-4 py-2.5 text-sm text-overlay/60 transition-colors hover:bg-overlay/5 hover:text-red-300"
      >
        <LogOut size={16} /> Sign Out
      </button>
    </nav>
  );
}

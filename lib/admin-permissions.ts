import {
  LayoutDashboard,
  Package,
  Boxes,
  ShoppingCart,
  Users,
  Tag,
  Layers,
  FolderTree,
  Star,
  Newspaper,
  Image as ImageIcon,
  BarChart3,
  FileClock,
  ShieldCheck,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { AdminRole } from "@/types";

export interface AdminNavSection {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  roles: AdminRole[];
}

export const ADMIN_ROLES: AdminRole[] = ["Super Admin", "Admin", "Support", "Content Editor"];

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: LayoutDashboard, roles: ["Super Admin", "Admin", "Support", "Content Editor"] },
  { key: "products", label: "Products", href: "/admin/products", icon: Package, roles: ["Super Admin", "Admin"] },
  { key: "inventory", label: "Inventory", href: "/admin/inventory", icon: Boxes, roles: ["Super Admin", "Admin"] },
  { key: "orders", label: "Orders", href: "/admin/orders", icon: ShoppingCart, roles: ["Super Admin", "Admin", "Support"] },
  { key: "customers", label: "Customers", href: "/admin/customers", icon: Users, roles: ["Super Admin", "Admin", "Support"] },
  { key: "coupons", label: "Coupons", href: "/admin/coupons", icon: Tag, roles: ["Super Admin", "Admin"] },
  { key: "collections", label: "Collections", href: "/admin/collections", icon: Layers, roles: ["Super Admin", "Admin", "Content Editor"] },
  { key: "categories", label: "Categories", href: "/admin/categories", icon: FolderTree, roles: ["Super Admin", "Admin", "Content Editor"] },
  { key: "reviews", label: "Reviews", href: "/admin/reviews", icon: Star, roles: ["Super Admin", "Admin", "Support", "Content Editor"] },
  { key: "blog", label: "Blog", href: "/admin/blog", icon: Newspaper, roles: ["Super Admin", "Admin", "Content Editor"] },
  { key: "banners", label: "Banners", href: "/admin/banners", icon: ImageIcon, roles: ["Super Admin", "Admin", "Content Editor"] },
  { key: "analytics", label: "Analytics", href: "/admin/analytics", icon: BarChart3, roles: ["Super Admin", "Admin"] },
  { key: "logs", label: "System Logs", href: "/admin/logs", icon: FileClock, roles: ["Super Admin", "Admin"] },
  { key: "users", label: "Admin Users", href: "/admin/users", icon: ShieldCheck, roles: ["Super Admin"] },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: Settings, roles: ["Super Admin"] },
];

export function getNavForRole(role: AdminRole): AdminNavSection[] {
  return ADMIN_NAV_SECTIONS.filter((section) => section.roles.includes(role));
}

export function isSectionAllowed(sectionKey: string, role: AdminRole): boolean {
  const section = ADMIN_NAV_SECTIONS.find((s) => s.key === sectionKey);
  if (!section) return true;
  return section.roles.includes(role);
}

export function sectionForPath(pathname: string): AdminNavSection | undefined {
  const sorted = [...ADMIN_NAV_SECTIONS].sort((a, b) => b.href.length - a.href.length);
  return sorted.find((s) => pathname === s.href || pathname.startsWith(`${s.href}/`));
}

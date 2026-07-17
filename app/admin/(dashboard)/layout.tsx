import { RequireAdminAuth } from "@/components/admin/require-admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";
import { CatalogHydration } from "@/components/providers/catalog-hydration";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdminAuth>
      <CatalogHydration />
      <AdminShell>{children}</AdminShell>
    </RequireAdminAuth>
  );
}

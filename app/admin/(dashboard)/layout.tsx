import { RequireAdminAuth } from "@/components/admin/require-admin-auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAdminAuth>
      <AdminShell>{children}</AdminShell>
    </RequireAdminAuth>
  );
}

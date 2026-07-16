"use client";

import { useState } from "react";
import { Plus, Ban, CheckCircle2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useToastStore } from "@/lib/store/toast-store";
import { ADMIN_ROLES } from "@/lib/admin-permissions";
import { AdminAccount, AdminRole } from "@/types";
import { formatDate } from "@/lib/utils";

export default function AdminUsersPage() {
  const admins = useAdminAuthStore((s) => s.admins);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const addAdmin = useAdminAuthStore((s) => s.addAdmin);
  const updateAdmin = useAdminAuthStore((s) => s.updateAdmin);
  const toggleActive = useAdminAuthStore((s) => s.toggleActive);
  const log = useAuditLogStore((s) => s.log);
  const showToast = useToastStore((s) => s.show);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("Support");

  function handleCreate() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      showToast("Please fill in all fields (password must be 6+ characters).", "error");
      return;
    }
    const result = addAdmin({ name: name.trim(), email: email.trim(), password, role });
    if (!result.success) {
      showToast(result.message, "error");
      return;
    }
    log({ actor: currentAdmin?.name ?? "Admin", action: `Created admin account (${role})`, target: email, category: "User" });
    showToast(result.message);
    setModalOpen(false);
    setName("");
    setEmail("");
    setPassword("");
    setRole("Support");
  }

  function handleToggle(admin: AdminAccount) {
    if (admin.id === currentAdmin?.id) {
      showToast("You cannot deactivate your own account.", "error");
      return;
    }
    toggleActive(admin.id);
    log({
      actor: currentAdmin?.name ?? "Admin",
      action: admin.active ? "Deactivated admin account" : "Reactivated admin account",
      target: admin.email,
      category: "User",
    });
    showToast(`${admin.name} is now ${admin.active ? "inactive" : "active"}.`);
  }

  function handleRoleChange(admin: AdminAccount, newRole: AdminRole) {
    updateAdmin(admin.id, { role: newRole });
    log({ actor: currentAdmin?.name ?? "Admin", action: `Changed role to ${newRole}`, target: admin.email, category: "User" });
    showToast(`${admin.name}'s role updated to ${newRole}.`);
  }

  const columns: DataTableColumn<AdminAccount>[] = [
    { key: "name", label: "Name", sortValue: (a) => a.name, render: (a) => <span className="font-medium text-brand-white">{a.name}</span> },
    { key: "email", label: "Email", render: (a) => <span className="text-white/60">{a.email}</span> },
    {
      key: "role",
      label: "Role",
      render: (a) => (
        <Select
          value={a.role}
          onChange={(e) => handleRoleChange(a, e.target.value as AdminRole)}
          disabled={a.id === currentAdmin?.id}
          className="!w-40 !py-1.5 !text-xs"
        >
          {ADMIN_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </Select>
      ),
    },
    { key: "lastLogin", label: "Last Login", render: (a) => (a.lastLogin ? formatDate(a.lastLogin) : "Never") },
    { key: "status", label: "Status", render: (a) => <Badge variant={a.active ? "gold" : "danger"}>{a.active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (a) => (
        <button
          onClick={() => handleToggle(a)}
          disabled={a.id === currentAdmin?.id}
          className="flex items-center gap-1 text-xs text-white/50 hover:text-gold disabled:opacity-30"
        >
          {a.active ? <Ban size={13} /> : <CheckCircle2 size={13} />}
          {a.active ? "Deactivate" : "Activate"}
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Admin Users"
        description="Manage internal console access and role assignments."
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus size={14} /> Add Admin
          </Button>
        }
      />
      <DataTable columns={columns} rows={admins} getRowId={(a) => a.id} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="mb-6 font-serif text-xl text-brand-white">Add Admin User</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">Temporary Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select id="role" value={role} onChange={(e) => setRole(e.target.value as AdminRole)}>
              {ADMIN_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </div>
          <Button className="w-full" onClick={handleCreate}>
            Create Admin Account
          </Button>
        </div>
      </Modal>
    </div>
  );
}

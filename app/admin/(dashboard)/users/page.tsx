"use client";

import { useEffect, useState } from "react";
import { Plus, Ban, CheckCircle2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { useAdminAuthStore, AdminSession } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { ADMIN_ROLES } from "@/lib/admin-permissions";
import { AdminRole } from "@/types";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

export default function AdminUsersPage() {
  const admins = useAdminAuthStore((s) => s.admins);
  const adminsLoading = useAdminAuthStore((s) => s.adminsLoading);
  const fetchAdmins = useAdminAuthStore((s) => s.fetchAdmins);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const addAdmin = useAdminAuthStore((s) => s.addAdmin);
  const updateAdminRole = useAdminAuthStore((s) => s.updateAdminRole);
  const toggleActive = useAdminAuthStore((s) => s.toggleActive);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminRole>("Support");

  async function handleCreate() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      showToast("Please fill in all fields (password must be 6+ characters).", "error");
      return;
    }
    const result = await addAdmin({ name: name.trim(), email: email.trim(), password, role });
    if (!result.success) {
      showToast(result.message, "error");
      return;
    }
    showToast(result.message);
    setModalOpen(false);
    setName("");
    setEmail("");
    setPassword("");
    setRole("Support");
  }

  async function handleToggle(admin: AdminSession) {
    if (admin.id === currentAdmin?.id) {
      showToast("You cannot deactivate your own account.", "error");
      return;
    }
    try {
      await toggleActive(admin.id);
      showToast(`${admin.name} is now ${admin.active ? "inactive" : "active"}.`);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleRoleChange(admin: AdminSession, newRole: AdminRole) {
    try {
      await updateAdminRole(admin.id, newRole);
      showToast(`${admin.name}'s role updated to ${newRole}.`);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  const columns: DataTableColumn<AdminSession>[] = [
    { key: "name", label: "Name", sortValue: (a) => a.name, render: (a) => <span className="font-medium text-fg">{a.name}</span> },
    { key: "email", label: "Email", render: (a) => <span className="text-overlay/60">{a.email}</span> },
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
          className="flex items-center gap-1 text-xs text-overlay/50 hover:text-gold disabled:opacity-30"
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
      <DataTable
        columns={columns}
        rows={admins}
        getRowId={(a) => a.id}
        emptyMessage={adminsLoading ? "Loading admin users…" : "No admin users yet."}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="mb-6 font-serif text-xl text-fg">Add Admin User</h3>
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

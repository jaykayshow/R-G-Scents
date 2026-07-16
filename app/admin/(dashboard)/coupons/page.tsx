"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { useCouponsStore } from "@/lib/store/coupons-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { Coupon, CouponType } from "@/types";
import { formatDate } from "@/lib/utils";

function blankCoupon(): Coupon {
  return {
    code: "",
    type: "percentage",
    value: 10,
    description: "",
    active: true,
    usageCount: 0,
  };
}

export default function AdminCouponsPage() {
  const coupons = useCouponsStore((s) => s.coupons);
  const addCoupon = useCouponsStore((s) => s.addCoupon);
  const updateCoupon = useCouponsStore((s) => s.updateCoupon);
  const deleteCoupon = useCouponsStore((s) => s.deleteCoupon);
  const log = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [draft, setDraft] = useState<Coupon>(blankCoupon());

  function openCreate() {
    setDraft(blankCoupon());
    setEditingCode(null);
    setModalOpen(true);
  }

  function openEdit(coupon: Coupon) {
    setDraft(coupon);
    setEditingCode(coupon.code);
    setModalOpen(true);
  }

  function handleSave() {
    if (!draft.code.trim() || !draft.description.trim()) {
      showToast("Code and description are required.", "error");
      return;
    }
    const normalized: Coupon = { ...draft, code: draft.code.trim().toUpperCase() };
    if (editingCode) {
      updateCoupon(editingCode, normalized);
      log({ actor: currentAdmin?.name ?? "Admin", action: "Updated coupon", target: normalized.code, category: "Coupon" });
      showToast(`Coupon ${normalized.code} updated.`);
    } else {
      if (coupons.some((c) => c.code === normalized.code)) {
        showToast("A coupon with this code already exists.", "error");
        return;
      }
      addCoupon(normalized);
      log({ actor: currentAdmin?.name ?? "Admin", action: "Created coupon", target: normalized.code, category: "Coupon" });
      showToast(`Coupon ${normalized.code} created.`);
    }
    setModalOpen(false);
  }

  function handleDelete(code: string) {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    deleteCoupon(code);
    log({ actor: currentAdmin?.name ?? "Admin", action: "Deleted coupon", target: code, category: "Coupon" });
    showToast(`Coupon ${code} deleted.`);
  }

  const columns: DataTableColumn<Coupon>[] = [
    { key: "code", label: "Code", sortValue: (c) => c.code, render: (c) => <span className="font-mono font-medium text-brand-white">{c.code}</span> },
    { key: "type", label: "Type", render: (c) => c.type.replace("-", " ") },
    {
      key: "value",
      label: "Value",
      render: (c) => (c.type === "percentage" ? `${c.value}%` : c.type === "fixed" ? `$${c.value}` : "Free shipping"),
    },
    { key: "usage", label: "Usage", render: (c) => `${c.usageCount}${c.usageLimit ? ` / ${c.usageLimit}` : ""}` },
    { key: "expires", label: "Expires", render: (c) => (c.expiresAt ? formatDate(c.expiresAt) : "—") },
    { key: "status", label: "Status", render: (c) => <Badge variant={c.active ? "gold" : "danger"}>{c.active ? "Active" : "Inactive"}</Badge> },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => openEdit(c)} className="text-xs text-gold hover:underline">Edit</button>
          <button onClick={() => handleDelete(c.code)} className="text-xs text-white/40 hover:text-red-300">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Coupons"
        description={`${coupons.length} discount codes`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> Create Coupon
          </Button>
        }
      />
      <DataTable columns={columns} rows={coupons} getRowId={(c) => c.code} emptyMessage="No coupons yet." />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="mb-6 font-serif text-xl text-brand-white">{editingCode ? "Edit Coupon" : "Create Coupon"}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="code">Code</Label>
            <Input
              id="code"
              value={draft.code}
              disabled={!!editingCode}
              onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value.toUpperCase() }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                id="type"
                value={draft.type}
                onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as CouponType }))}
              >
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed Amount</option>
                <option value="free-shipping">Free Shipping</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                disabled={draft.type === "free-shipping"}
                value={draft.value}
                onChange={(e) => setDraft((d) => ({ ...d, value: Number(e.target.value) }))}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="minSubtotal">Minimum Subtotal ($)</Label>
              <Input
                id="minSubtotal"
                type="number"
                value={draft.minSubtotal ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, minSubtotal: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="usageLimit">Usage Limit</Label>
              <Input
                id="usageLimit"
                type="number"
                value={draft.usageLimit ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, usageLimit: e.target.value ? Number(e.target.value) : undefined }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => setDraft((d) => ({ ...d, active: e.target.checked }))}
              className="h-4 w-4 accent-[#c9a24b]"
            />
            Active
          </label>
          <Button className="w-full" onClick={handleSave}>
            {editingCode ? "Save Changes" : "Create Coupon"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

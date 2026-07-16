"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { useBannersStore } from "@/lib/store/banners-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { Banner } from "@/types";

function blankBanner(): Banner {
  return {
    id: `ban-${Date.now()}`,
    title: "",
    subtitle: "",
    ctaLabel: "",
    ctaHref: "/shop",
    active: false,
    placement: "homepage-top",
  };
}

export default function AdminBannersPage() {
  const banners = useBannersStore((s) => s.banners);
  const addBanner = useBannersStore((s) => s.addBanner);
  const updateBanner = useBannersStore((s) => s.updateBanner);
  const deleteBanner = useBannersStore((s) => s.deleteBanner);
  const toggleActive = useBannersStore((s) => s.toggleActive);
  const log = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Banner>(blankBanner());

  function openCreate() {
    setDraft(blankBanner());
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(banner: Banner) {
    setDraft(banner);
    setEditingId(banner.id);
    setModalOpen(true);
  }

  function handleSave() {
    if (!draft.title.trim()) {
      showToast("Banner title is required.", "error");
      return;
    }
    if (editingId) {
      updateBanner(editingId, draft);
      log({ actor: currentAdmin?.name ?? "Admin", action: "Updated banner", target: draft.title, category: "Banner" });
      showToast(`Banner "${draft.title}" updated.`);
    } else {
      addBanner(draft);
      log({ actor: currentAdmin?.name ?? "Admin", action: "Created banner", target: draft.title, category: "Banner" });
      showToast(`Banner "${draft.title}" created.`);
    }
    setModalOpen(false);
  }

  function handleToggle(banner: Banner) {
    toggleActive(banner.id);
    log({
      actor: currentAdmin?.name ?? "Admin",
      action: banner.active ? "Deactivated banner" : "Activated banner",
      target: banner.title,
      category: "Banner",
    });
    showToast(`Banner "${banner.title}" is now ${banner.active ? "inactive" : "active"}.`);
  }

  function handleDelete(banner: Banner) {
    if (!confirm(`Delete banner "${banner.title}"?`)) return;
    deleteBanner(banner.id);
    log({ actor: currentAdmin?.name ?? "Admin", action: "Deleted banner", target: banner.title, category: "Banner" });
    showToast(`Banner "${banner.title}" deleted.`);
  }

  return (
    <div>
      <AdminPageHeader
        title="Banners"
        description="Only one active homepage banner is shown at a time — the first active match wins."
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> Add Banner
          </Button>
        }
      />

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="flex flex-col gap-3 rounded-md border border-white/10 bg-white/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-brand-white">{banner.title}</p>
                <Badge variant={banner.active ? "gold" : "outline"}>{banner.active ? "Active" : "Inactive"}</Badge>
              </div>
              {banner.subtitle && <p className="mt-1 text-sm text-white/50">{banner.subtitle}</p>}
              <p className="mt-1 text-xs text-white/30">Placement: {banner.placement}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => handleToggle(banner)}>
                {banner.active ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => openEdit(banner)}>
                <Pencil size={13} />
              </Button>
              <button onClick={() => handleDelete(banner)} className="text-white/40 hover:text-red-300">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="mb-6 font-serif text-xl text-brand-white">{editingId ? "Edit Banner" : "Create Banner"}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" value={draft.subtitle ?? ""} onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ctaLabel">CTA Label</Label>
              <Input id="ctaLabel" value={draft.ctaLabel ?? ""} onChange={(e) => setDraft((d) => ({ ...d, ctaLabel: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="ctaHref">CTA Link</Label>
              <Input id="ctaHref" value={draft.ctaHref ?? ""} onChange={(e) => setDraft((d) => ({ ...d, ctaHref: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label htmlFor="placement">Placement</Label>
            <Select
              id="placement"
              value={draft.placement}
              onChange={(e) => setDraft((d) => ({ ...d, placement: e.target.value as Banner["placement"] }))}
            >
              <option value="homepage-top">Homepage Top Bar</option>
              <option value="homepage-hero">Homepage Hero</option>
              <option value="campaign">Campaign Takeover</option>
            </Select>
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
            {editingId ? "Save Changes" : "Create Banner"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

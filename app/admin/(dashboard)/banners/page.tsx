"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Select } from "@/components/ui/input";
import { useBannersStore } from "@/lib/store/banners-store";
import { useToastStore } from "@/lib/store/toast-store";
import { Banner } from "@/types";
import { ApiError } from "@/lib/api-client";

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

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

export default function AdminBannersPage() {
  const banners = useBannersStore((s) => s.banners);
  const loading = useBannersStore((s) => s.loading);
  const fetchBanners = useBannersStore((s) => s.fetchBanners);
  const addBanner = useBannersStore((s) => s.addBanner);
  const updateBanner = useBannersStore((s) => s.updateBanner);
  const deleteBanner = useBannersStore((s) => s.deleteBanner);
  const toggleActive = useBannersStore((s) => s.toggleActive);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

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

  async function handleSave() {
    if (!draft.title.trim()) {
      showToast("Banner title is required.", "error");
      return;
    }
    try {
      if (editingId) {
        await updateBanner(editingId, draft);
        showToast(`Banner "${draft.title}" updated.`);
      } else {
        await addBanner(draft);
        showToast(`Banner "${draft.title}" created.`);
      }
      setModalOpen(false);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleToggle(banner: Banner) {
    try {
      await toggleActive(banner.id);
      showToast(`Banner "${banner.title}" is now ${banner.active ? "inactive" : "active"}.`);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleDelete(banner: Banner) {
    if (!confirm(`Delete banner "${banner.title}"?`)) return;
    try {
      await deleteBanner(banner.id);
      showToast(`Banner "${banner.title}" deleted.`);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
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
          <div key={banner.id} className="flex flex-col gap-3 rounded-md border border-overlay/10 bg-overlay/[0.02] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="font-medium text-fg">{banner.title}</p>
                <Badge variant={banner.active ? "gold" : "outline"}>{banner.active ? "Active" : "Inactive"}</Badge>
              </div>
              {banner.subtitle && <p className="mt-1 text-sm text-overlay/50">{banner.subtitle}</p>}
              <p className="mt-1 text-xs text-overlay/30">Placement: {banner.placement}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" size="sm" onClick={() => handleToggle(banner)}>
                {banner.active ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => openEdit(banner)}>
                <Pencil size={13} />
              </Button>
              <button onClick={() => handleDelete(banner)} className="text-overlay/40 hover:text-red-300">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="mb-6 font-serif text-xl text-fg">{editingId ? "Edit Banner" : "Create Banner"}</h3>
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
          <label className="flex items-center gap-2 text-sm text-overlay/70">
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

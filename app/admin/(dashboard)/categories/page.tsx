"use client";

import { useState } from "react";
import { Plus, Trash2, Pencil } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useCategoriesStore } from "@/lib/store/categories-store";
import { useToastStore } from "@/lib/store/toast-store";
import { Category } from "@/types";
import { ApiError } from "@/lib/api-client";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function blankCategory(): Category {
  return { id: `cat-${Date.now()}`, name: "", slug: "", description: "" };
}

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

export default function AdminCategoriesPage() {
  const categories = useCategoriesStore((s) => s.categories);
  const loading = useCategoriesStore((s) => s.loading);
  const addCategory = useCategoriesStore((s) => s.addCategory);
  const updateCategory = useCategoriesStore((s) => s.updateCategory);
  const deleteCategory = useCategoriesStore((s) => s.deleteCategory);
  const showToast = useToastStore((s) => s.show);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Category>(blankCategory());

  function openCreate() {
    setDraft(blankCategory());
    setEditingId(null);
    setModalOpen(true);
  }

  function openEdit(category: Category) {
    setDraft(category);
    setEditingId(category.id);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!draft.name.trim()) {
      showToast("Category name is required.", "error");
      return;
    }
    const normalized = { ...draft, slug: slugify(draft.name) };
    try {
      if (editingId) {
        await updateCategory(editingId, normalized);
        showToast(`${normalized.name} updated.`);
      } else {
        await addCategory(normalized);
        showToast(`${normalized.name} created.`);
      }
      setModalOpen(false);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleDelete(category: Category) {
    if (!confirm(`Delete category "${category.name}"?`)) return;
    try {
      await deleteCategory(category.id);
      showToast(`${category.name} deleted.`);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  const columns: DataTableColumn<Category>[] = [
    { key: "name", label: "Name", sortValue: (c) => c.name, render: (c) => <span className="font-medium text-fg">{c.name}</span> },
    { key: "slug", label: "Slug", render: (c) => <span className="font-mono text-xs text-overlay/40">{c.slug}</span> },
    { key: "description", label: "Description", render: (c) => c.description },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end gap-3">
          <button onClick={() => openEdit(c)} className="text-xs text-gold hover:underline">
            <Pencil size={12} className="inline" /> Edit
          </button>
          <button onClick={() => handleDelete(c)} className="text-xs text-overlay/40 hover:text-red-300">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description={`${categories.length} taxonomy tags`}
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus size={14} /> Add Category
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={categories}
        getRowId={(c) => c.id}
        emptyMessage={loading ? "Loading categories…" : "No categories yet."}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="mb-6 font-serif text-xl text-fg">{editingId ? "Edit Category" : "Add Category"}</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={draft.description} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} />
          </div>
          <Button className="w-full" onClick={handleSave}>
            {editingId ? "Save Changes" : "Create Category"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

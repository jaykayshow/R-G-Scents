"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Save } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useCollectionsStore } from "@/lib/store/collections-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { CollectionMeta } from "@/types";

export default function AdminCollectionsPage() {
  const collections = useCollectionsStore((s) => s.collections);
  const updateCollection = useCollectionsStore((s) => s.updateCollection);
  const log = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

  const [editing, setEditing] = useState<CollectionMeta | null>(null);

  function handleSave() {
    if (!editing) return;
    updateCollection(editing.slug, editing);
    log({ actor: currentAdmin?.name ?? "Admin", action: "Updated collection", target: editing.name, category: "Product" });
    showToast(`${editing.name} collection updated.`);
    setEditing(null);
  }

  return (
    <div>
      <AdminPageHeader title="Collections" description="The five pillars of The Billionaire Collection." />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <div key={collection.slug} className="rounded-md border border-white/10 bg-white/[0.02] p-5">
            <div className="relative aspect-square overflow-hidden rounded-sm bg-white/5">
              <Image src={collection.heroImage} alt={collection.name} fill className="object-contain p-6" />
            </div>
            <h3 className="mt-4 font-serif text-lg text-brand-white">{collection.name}</h3>
            <p className="mt-1 text-sm text-white/50 line-clamp-2">{collection.description}</p>
            <Button variant="secondary" size="sm" className="mt-4 w-full" onClick={() => setEditing(collection)}>
              <Pencil size={13} /> Edit
            </Button>
          </div>
        ))}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)}>
        {editing && (
          <>
            <h3 className="mb-6 font-serif text-xl text-brand-white">Edit {editing.name}</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input id="name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="heroImage">Hero Image Path</Label>
                <Input id="heroImage" value={editing.heroImage} onChange={(e) => setEditing({ ...editing, heroImage: e.target.value })} />
              </div>
              <Button className="w-full" onClick={handleSave}>
                <Save size={14} /> Save Changes
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}

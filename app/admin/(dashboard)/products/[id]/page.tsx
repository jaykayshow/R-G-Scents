"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { useProductsStore } from "@/lib/store/products-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { Product, ProductVariant, CollectionSlug, Gender } from "@/types";
import Link from "next/link";

const emptyVariant = (): ProductVariant => ({
  id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  size: "50ml",
  sku: "",
  barcode: "",
  price: 0,
  stock: 0,
});

function blankProduct(): Product {
  return {
    id: `p-${Date.now()}`,
    slug: "",
    name: "",
    collection: "legacy",
    tagline: "",
    shortDescription: "",
    longDescription: "",
    gender: "Unisex",
    price: 0,
    images: ["/products/legacy.png"],
    notes: { top: [], middle: [], base: [] },
    longevity: "Moderate",
    projection: "Moderate",
    occasion: [],
    season: [],
    ingredients: [],
    rating: 0,
    reviewCount: 0,
    salesCount: 0,
    isNew: true,
    isLimitedEdition: false,
    createdAt: new Date().toISOString(),
    variants: [emptyVariant()],
    stock: 0,
    metaTitle: "",
    metaDescription: "",
    imageAlt: "",
  };
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function ProductEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === "new";
  const router = useRouter();

  const products = useProductsStore((s) => s.products);
  const addProduct = useProductsStore((s) => s.addProduct);
  const updateProduct = useProductsStore((s) => s.updateProduct);
  const deleteProduct = useProductsStore((s) => s.deleteProduct);
  const log = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

  const existing = isNew ? undefined : products.find((p) => p.id === id);
  const [draft, setDraft] = useState<Product>(existing ?? blankProduct());
  const [notesTop, setNotesTop] = useState(existing?.notes.top.join(", ") ?? "");
  const [notesMiddle, setNotesMiddle] = useState(existing?.notes.middle.join(", ") ?? "");
  const [notesBase, setNotesBase] = useState(existing?.notes.base.join(", ") ?? "");
  const [occasion, setOccasion] = useState(existing?.occasion.join(", ") ?? "");
  const [season, setSeason] = useState(existing?.season.join(", ") ?? "");
  const [ingredients, setIngredients] = useState(existing?.ingredients.join(", ") ?? "");
  const [imagesText, setImagesText] = useState(existing?.images.join("\n") ?? "/products/legacy.png");
  const [errors, setErrors] = useState<string[]>([]);

  if (!isNew && !existing) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-overlay/50">Product not found.</p>
        <Link href="/admin/products" className="text-xs text-gold hover:underline">
          &larr; Back to Products
        </Link>
      </div>
    );
  }

  function updateVariant(index: number, patch: Partial<ProductVariant>) {
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)),
    }));
  }

  function addVariant() {
    setDraft((d) => ({ ...d, variants: [...d.variants, emptyVariant()] }));
  }

  function removeVariant(index: number) {
    setDraft((d) => ({ ...d, variants: d.variants.filter((_, i) => i !== index) }));
  }

  function handleSave() {
    const validationErrors: string[] = [];
    if (!draft.name.trim()) validationErrors.push("Product name is required.");
    const slug = slugify(draft.slug || draft.name);
    if (!slug) validationErrors.push("A valid slug is required.");
    const slugTaken = products.some((p) => p.slug === slug && p.id !== draft.id);
    if (slugTaken) validationErrors.push(`Slug "${slug}" is already in use by another product.`);
    if (draft.variants.length === 0) validationErrors.push("At least one variant is required.");
    if (draft.variants.some((v) => !v.sku.trim())) validationErrors.push("Every variant needs a SKU.");
    if (draft.price <= 0) validationErrors.push("Price must be greater than 0.");

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);

    const images = imagesText.split("\n").map((s) => s.trim()).filter(Boolean);
    const finalProduct: Product = {
      ...draft,
      slug,
      images: images.length ? images : ["/products/legacy.png"],
      notes: {
        top: notesTop.split(",").map((s) => s.trim()).filter(Boolean),
        middle: notesMiddle.split(",").map((s) => s.trim()).filter(Boolean),
        base: notesBase.split(",").map((s) => s.trim()).filter(Boolean),
      },
      occasion: occasion.split(",").map((s) => s.trim()).filter(Boolean),
      season: season.split(",").map((s) => s.trim()).filter(Boolean),
      ingredients: ingredients.split(",").map((s) => s.trim()).filter(Boolean),
      stock: draft.variants.reduce((sum, v) => sum + v.stock, 0),
    };

    if (isNew) {
      addProduct(finalProduct);
      log({ actor: currentAdmin?.name ?? "Admin", action: "Created product", target: finalProduct.name, category: "Product" });
      showToast(`${finalProduct.name} created.`);
    } else {
      updateProduct(finalProduct.id, finalProduct);
      log({ actor: currentAdmin?.name ?? "Admin", action: "Updated product", target: finalProduct.name, category: "Product" });
      showToast(`${finalProduct.name} updated.`);
    }
    router.push("/admin/products");
  }

  function handleDelete() {
    if (!existing) return;
    if (!confirm(`Delete "${existing.name}"? This cannot be undone.`)) return;
    deleteProduct(existing.id);
    log({ actor: currentAdmin?.name ?? "Admin", action: "Deleted product", target: existing.name, category: "Product" });
    showToast(`${existing.name} deleted.`);
    router.push("/admin/products");
  }

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-xs text-overlay/40 hover:text-gold">
        <ArrowLeft size={13} /> Back to Products
      </Link>
      <AdminPageHeader
        title={isNew ? "Add Product" : `Edit ${existing?.name}`}
        description={isNew ? "Create a new fragrance for the catalog." : `SKU count: ${draft.variants.length}`}
        actions={
          <>
            {!isNew && (
              <Button variant="secondary" size="sm" onClick={handleDelete} className="border-red-400/40 text-red-300 hover:bg-red-400 hover:text-ink">
                <Trash2 size={14} /> Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSave}>
              <Save size={14} /> Save Product
            </Button>
          </>
        }
      />

      {errors.length > 0 && (
        <div className="mb-6 rounded-md border border-red-400/30 bg-red-400/5 p-4 text-sm text-red-300">
          <ul className="list-inside list-disc space-y-1">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Product Name</Label>
                <Input
                  id="name"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={draft.slug}
                  placeholder={slugify(draft.name)}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="collection">Collection</Label>
                  <Select
                    id="collection"
                    value={draft.collection}
                    onChange={(e) => setDraft((d) => ({ ...d, collection: e.target.value as CollectionSlug }))}
                  >
                    {["legacy", "reserve", "royale", "elite", "noir"].map((c) => (
                      <option key={c} value={c}>
                        {c.charAt(0).toUpperCase() + c.slice(1)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                    id="gender"
                    value={draft.gender}
                    onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value as Gender }))}
                  >
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Unisex">Unisex</option>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input id="tagline" value={draft.tagline} onChange={(e) => setDraft((d) => ({ ...d, tagline: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="shortDescription">Short Description</Label>
                <Textarea
                  id="shortDescription"
                  value={draft.shortDescription}
                  onChange={(e) => setDraft((d) => ({ ...d, shortDescription: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="longDescription">Long Description</Label>
                <Textarea
                  id="longDescription"
                  className="min-h-40"
                  value={draft.longDescription}
                  onChange={(e) => setDraft((d) => ({ ...d, longDescription: e.target.value }))}
                />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm text-overlay/70">
                  <input
                    type="checkbox"
                    checked={draft.isNew}
                    onChange={(e) => setDraft((d) => ({ ...d, isNew: e.target.checked }))}
                    className="h-4 w-4 accent-[#c9a24b]"
                  />
                  Mark as New
                </label>
                <label className="flex items-center gap-2 text-sm text-overlay/70">
                  <input
                    type="checkbox"
                    checked={draft.isLimitedEdition}
                    onChange={(e) => setDraft((d) => ({ ...d, isLimitedEdition: e.target.checked }))}
                    className="h-4 w-4 accent-[#c9a24b]"
                  />
                  Limited Edition
                </label>
              </div>
            </div>
          </section>

          <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Media</h2>
            <Label htmlFor="images">Image Paths (one per line)</Label>
            <Textarea id="images" value={imagesText} onChange={(e) => setImagesText(e.target.value)} />
            <div className="mt-4">
              <Label htmlFor="imageAlt">Image Alt Text (SEO)</Label>
              <Input
                id="imageAlt"
                value={draft.imageAlt ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, imageAlt: e.target.value }))}
              />
            </div>
          </section>

          <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">SEO</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="metaTitle">Meta Title</Label>
                <Input
                  id="metaTitle"
                  value={draft.metaTitle ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, metaTitle: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea
                  id="metaDescription"
                  value={draft.metaDescription ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, metaDescription: e.target.value }))}
                />
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Pricing</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Base Price ($)</Label>
                <Input
                  id="price"
                  type="number"
                  value={draft.price}
                  onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="compareAtPrice">Compare-at Price ($)</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  value={draft.compareAtPrice ?? ""}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, compareAtPrice: e.target.value ? Number(e.target.value) : undefined }))
                  }
                />
              </div>
            </div>
          </section>

          <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-overlay/50">Variants</h2>
              <Button variant="secondary" size="sm" onClick={addVariant}>
                <Plus size={13} /> Add Variant
              </Button>
            </div>
            <div className="space-y-4">
              {draft.variants.map((variant, i) => (
                <div key={variant.id} className="grid grid-cols-2 gap-3 rounded-sm border border-overlay/10 p-3 sm:grid-cols-5">
                  <Input placeholder="Size" value={variant.size} onChange={(e) => updateVariant(i, { size: e.target.value })} />
                  <Input placeholder="SKU" value={variant.sku} onChange={(e) => updateVariant(i, { sku: e.target.value })} />
                  <Input placeholder="Barcode" value={variant.barcode} onChange={(e) => updateVariant(i, { barcode: e.target.value })} />
                  <Input
                    type="number"
                    placeholder="Price"
                    value={variant.price}
                    onChange={(e) => updateVariant(i, { price: Number(e.target.value) })}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Stock"
                      value={variant.stock}
                      onChange={(e) => updateVariant(i, { stock: Number(e.target.value) })}
                    />
                    <button
                      onClick={() => removeVariant(i)}
                      className="shrink-0 text-overlay/30 hover:text-red-300"
                      aria-label="Remove variant"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Fragrance Notes</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notesTop">Top Notes (comma-separated)</Label>
                <Input id="notesTop" value={notesTop} onChange={(e) => setNotesTop(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="notesMiddle">Middle Notes</Label>
                <Input id="notesMiddle" value={notesMiddle} onChange={(e) => setNotesMiddle(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="notesBase">Base Notes</Label>
                <Input id="notesBase" value={notesBase} onChange={(e) => setNotesBase(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Performance</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="longevity">Longevity</Label>
                <Select
                  id="longevity"
                  value={draft.longevity}
                  onChange={(e) => setDraft((d) => ({ ...d, longevity: e.target.value as Product["longevity"] }))}
                >
                  <option value="Moderate">Moderate</option>
                  <option value="Long Lasting">Long Lasting</option>
                  <option value="Eternal">Eternal</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="projection">Projection</Label>
                <Select
                  id="projection"
                  value={draft.projection}
                  onChange={(e) => setDraft((d) => ({ ...d, projection: e.target.value as Product["projection"] }))}
                >
                  <option value="Intimate">Intimate</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Strong">Strong</option>
                  <option value="Beast Mode">Beast Mode</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="occasion">Occasion (comma-separated)</Label>
                <Input id="occasion" value={occasion} onChange={(e) => setOccasion(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="season">Season (comma-separated)</Label>
                <Input id="season" value={season} onChange={(e) => setSeason(e.target.value)} />
              </div>
            </div>
            <div className="mt-4">
              <Label htmlFor="ingredients">Ingredients (comma-separated)</Label>
              <Textarea id="ingredients" value={ingredients} onChange={(e) => setIngredients(e.target.value)} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

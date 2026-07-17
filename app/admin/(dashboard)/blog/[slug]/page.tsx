"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useBlogStore } from "@/lib/store/blog-store";
import { useToastStore } from "@/lib/store/toast-store";
import { BlogPost } from "@/lib/mock-data/blog";
import { ApiError } from "@/lib/api-client";

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function blankPost(): BlogPost {
  return {
    slug: "",
    title: "",
    excerpt: "",
    content: [""],
    category: "Fragrance Tips",
    author: "R&G Scents Editorial",
    date: new Date().toISOString().slice(0, 10),
    image: "/products/legacy.png",
    published: false,
  };
}

export default function AdminBlogEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const isNew = slug === "new";
  const router = useRouter();

  const posts = useBlogStore((s) => s.posts);
  const fetchAllForAdmin = useBlogStore((s) => s.fetchAllForAdmin);
  const addPost = useBlogStore((s) => s.addPost);
  const updatePost = useBlogStore((s) => s.updatePost);
  const deletePost = useBlogStore((s) => s.deletePost);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    if (posts.length === 0) fetchAllForAdmin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const existing = isNew ? undefined : posts.find((p) => p.slug === slug);
  const [draft, setDraft] = useState<BlogPost>(existing ?? blankPost());
  const [contentText, setContentText] = useState(existing?.content.join("\n\n") ?? "");
  const [error, setError] = useState("");

  if (!isNew && !existing) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-overlay/50">Article not found.</p>
        <Link href="/admin/blog" className="text-xs text-gold hover:underline">
          &larr; Back to Blog
        </Link>
      </div>
    );
  }

  async function handleSave() {
    if (!draft.title.trim()) {
      setError("Title is required.");
      return;
    }
    const newSlug = slugify(draft.slug || draft.title);
    const slugTaken = posts.some((p) => p.slug === newSlug && p.slug !== existing?.slug);
    if (slugTaken) {
      setError(`Slug "${newSlug}" is already in use.`);
      return;
    }
    setError("");

    const finalPost: BlogPost = {
      ...draft,
      slug: newSlug,
      content: contentText.split("\n\n").map((s) => s.trim()).filter(Boolean),
    };

    try {
      if (isNew) {
        await addPost(finalPost);
        showToast(`"${finalPost.title}" created.`);
      } else {
        await updatePost(existing!.slug, finalPost);
        showToast(`"${finalPost.title}" updated.`);
      }
      router.push("/admin/blog");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save article.");
    }
  }

  async function handleDelete() {
    if (!existing) return;
    if (!confirm(`Delete "${existing.title}"?`)) return;
    try {
      await deletePost(existing.slug);
      showToast(`"${existing.title}" deleted.`);
      router.push("/admin/blog");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not delete article.", "error");
    }
  }

  return (
    <div>
      <Link href="/admin/blog" className="mb-4 inline-flex items-center gap-1.5 text-xs text-overlay/40 hover:text-gold">
        <ArrowLeft size={13} /> Back to Blog
      </Link>
      <AdminPageHeader
        title={isNew ? "New Article" : `Edit: ${existing?.title}`}
        actions={
          <>
            {!isNew && (
              <Button variant="secondary" size="sm" onClick={handleDelete} className="border-red-400/40 text-red-300 hover:bg-red-400 hover:text-ink">
                <Trash2 size={14} /> Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSave}>
              <Save size={14} /> Save
            </Button>
          </>
        }
      />

      {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={draft.title} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea id="excerpt" value={draft.excerpt} onChange={(e) => setDraft((d) => ({ ...d, excerpt: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="content">Content (separate paragraphs with a blank line)</Label>
            <Textarea id="content" className="min-h-64" value={contentText} onChange={(e) => setContentText(e.target.value)} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5 space-y-4">
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={draft.slug} placeholder={slugify(draft.title)} onChange={(e) => setDraft((d) => ({ ...d, slug: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input id="category" value={draft.category} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="author">Author</Label>
              <Input id="author" value={draft.author} onChange={(e) => setDraft((d) => ({ ...d, author: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="date">Publish Date</Label>
              <Input id="date" type="date" value={draft.date} onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="image">Featured Image Path</Label>
              <Input id="image" value={draft.image} onChange={(e) => setDraft((d) => ({ ...d, image: e.target.value }))} />
            </div>
            <label className="flex items-center gap-2 text-sm text-overlay/70">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => setDraft((d) => ({ ...d, published: e.target.checked }))}
                className="h-4 w-4 accent-[#c9a24b]"
              />
              Published (visible on storefront)
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

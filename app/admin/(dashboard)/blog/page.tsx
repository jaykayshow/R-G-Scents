"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { DataTable, DataTableColumn } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBlogStore } from "@/lib/store/blog-store";
import { useToastStore } from "@/lib/store/toast-store";
import { BlogPost } from "@/lib/mock-data/blog";
import { formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

export default function AdminBlogPage() {
  const posts = useBlogStore((s) => s.posts);
  const loading = useBlogStore((s) => s.loading);
  const fetchAllForAdmin = useBlogStore((s) => s.fetchAllForAdmin);
  const deletePost = useBlogStore((s) => s.deletePost);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    fetchAllForAdmin();
  }, [fetchAllForAdmin]);

  async function handleDelete(post: BlogPost) {
    if (!confirm(`Delete "${post.title}"?`)) return;
    try {
      await deletePost(post.slug);
      showToast(`"${post.title}" deleted.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not delete article.", "error");
    }
  }

  const columns: DataTableColumn<BlogPost>[] = [
    {
      key: "title",
      label: "Title",
      sortValue: (p) => p.title,
      render: (p) => (
        <Link href={`/admin/blog/${p.slug}`} className="font-medium text-fg hover:text-gold">
          {p.title}
        </Link>
      ),
    },
    { key: "category", label: "Category", render: (p) => p.category },
    { key: "author", label: "Author", render: (p) => p.author },
    { key: "date", label: "Date", sortValue: (p) => p.date, render: (p) => formatDate(p.date) },
    {
      key: "status",
      label: "Status",
      render: (p) => <Badge variant={p.published ? "gold" : "outline"}>{p.published ? "Published" : "Draft"}</Badge>,
    },
    {
      key: "actions",
      label: "",
      className: "text-right",
      render: (p) => (
        <div className="flex justify-end gap-3">
          <Link href={`/admin/blog/${p.slug}`} className="text-xs text-gold hover:underline">Edit</Link>
          <button onClick={() => handleDelete(p)} className="text-xs text-overlay/40 hover:text-red-300">
            <Trash2 size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        title="Blog"
        description={`${posts.length} articles`}
        actions={
          <Link href="/admin/blog/new">
            <Button size="sm">
              <Plus size={14} /> New Article
            </Button>
          </Link>
        }
      />
      <DataTable
        columns={columns}
        rows={posts}
        getRowId={(p) => p.slug}
        emptyMessage={loading ? "Loading articles…" : "No articles yet."}
      />
    </div>
  );
}

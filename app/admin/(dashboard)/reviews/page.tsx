"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, X, Reply, BadgeCheck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Textarea } from "@/components/ui/input";
import { useReviewsStore } from "@/lib/store/reviews-store";
import { useProductsStore } from "@/lib/store/products-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { ReviewStatus } from "@/types";
import { formatDate } from "@/lib/utils";

const tabs: { key: ReviewStatus | "all"; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

export default function AdminReviewsPage() {
  const reviews = useReviewsStore((s) => s.reviews);
  const setStatus = useReviewsStore((s) => s.setStatus);
  const reply = useReviewsStore((s) => s.reply);
  const products = useProductsStore((s) => s.products);
  const log = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

  const [tab, setTab] = useState<ReviewStatus | "all">("pending");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const filtered = useMemo(
    () => (tab === "all" ? reviews : reviews.filter((r) => r.status === tab)),
    [reviews, tab]
  );

  function productName(productId: string) {
    return products.find((p) => p.id === productId)?.name ?? "Unknown Product";
  }

  function productSlug(productId: string) {
    return products.find((p) => p.id === productId)?.slug ?? "";
  }

  function handleApprove(id: string, author: string) {
    setStatus(id, "approved");
    log({ actor: currentAdmin?.name ?? "Admin", action: "Approved review", target: `Review by ${author}`, category: "Review" });
    showToast("Review approved and now visible on the storefront.");
  }

  function handleReject(id: string, author: string) {
    setStatus(id, "rejected");
    log({ actor: currentAdmin?.name ?? "Admin", action: "Rejected review", target: `Review by ${author}`, category: "Review" });
    showToast("Review rejected.", "info");
  }

  function handleReply(id: string) {
    if (!replyText.trim()) return;
    reply(id, replyText.trim());
    log({ actor: currentAdmin?.name ?? "Admin", action: "Replied to review", target: id, category: "Review" });
    showToast("Reply posted.");
    setReplyingId(null);
    setReplyText("");
  }

  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div>
      <AdminPageHeader
        title="Review Moderation"
        description={pendingCount > 0 ? `${pendingCount} review(s) awaiting moderation` : "All caught up — no reviews pending."}
      />

      <div className="mb-6 flex items-center gap-1 border-b border-white/10">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${
              tab === t.key ? "border-gold text-gold" : "border-transparent text-white/50 hover:text-white/80"
            }`}
          >
            {t.label}
            {t.key === "pending" && pendingCount > 0 && (
              <span className="ml-1.5 rounded-full bg-gold px-1.5 py-0.5 text-[10px] text-matte-black">{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/40">No reviews in this view.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div key={review.id} className="rounded-md border border-white/10 bg-white/[0.02] p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-brand-white">{review.author}</p>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold">
                        <BadgeCheck size={12} /> Verified
                      </span>
                    )}
                  </div>
                  <Link href={`/shop/${productSlug(review.productId)}`} target="_blank" className="text-xs text-white/40 hover:text-gold">
                    on {productName(review.productId)}
                  </Link>
                </div>
                <Badge
                  variant={review.status === "approved" ? "gold" : review.status === "rejected" ? "danger" : "outline"}
                >
                  {review.status}
                </Badge>
              </div>
              <StarRating rating={review.rating} className="mt-3" />
              <h4 className="mt-2 font-serif text-base text-brand-white">{review.title}</h4>
              <p className="mt-1 text-sm text-white/60">{review.content}</p>
              <p className="mt-2 text-xs text-white/30">{formatDate(review.date)}</p>

              {review.replies?.map((r, i) => (
                <div key={i} className="mt-3 rounded-sm border border-gold/20 bg-gold/5 p-3 text-sm">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold">{r.author}</p>
                  <p className="mt-1 text-white/70">{r.content}</p>
                </div>
              ))}

              <div className="mt-4 flex flex-wrap gap-2">
                {review.status !== "approved" && (
                  <Button size="sm" onClick={() => handleApprove(review.id, review.author)}>
                    <Check size={13} /> Approve
                  </Button>
                )}
                {review.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReject(review.id, review.author)}
                    className="border-red-400/40 text-red-300 hover:bg-red-400 hover:text-matte-black"
                  >
                    <X size={13} /> Reject
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => setReplyingId(replyingId === review.id ? null : review.id)}>
                  <Reply size={13} /> Reply
                </Button>
              </div>

              {replyingId === review.id && (
                <div className="mt-4 space-y-3">
                  <Textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write a public reply as R&G Scents Support..."
                  />
                  <Button size="sm" onClick={() => handleReply(review.id)}>
                    Post Reply
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

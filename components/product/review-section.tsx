"use client";

import { useState } from "react";
import { Review } from "@/types";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToastStore } from "@/lib/store/toast-store";
import { useReviewsStore } from "@/lib/store/reviews-store";
import { BadgeCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ReviewSection({
  reviews,
  averageRating,
}: {
  reviews: Review[];
  averageRating: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const showToast = useToastStore((s) => s.show);
  const addReview = useReviewsStore((s) => s.addReview);

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const total = reviews.length || 1;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draftTitle.trim() || !draftContent.trim()) {
      showToast("Please add a title and a review before submitting.", "error");
      return;
    }
    const newReview: Review = {
      id: `r-${Date.now()}`,
      productId: reviews[0]?.productId ?? "",
      author: "You",
      rating: draftRating,
      title: draftTitle,
      content: draftContent,
      date: new Date().toISOString(),
      verified: true,
      status: "pending",
    };
    addReview(newReview);
    setDraftTitle("");
    setDraftContent("");
    setDraftRating(5);
    setShowForm(false);
    showToast("Thank you — your review has been submitted for moderation.");
  }

  return (
    <div>
      <div className="flex flex-col gap-10 sm:flex-row">
        <div className="shrink-0 text-center sm:text-left">
          <p className="font-serif text-5xl text-fg">{averageRating.toFixed(1)}</p>
          <StarRating rating={averageRating} size={16} className="mt-2 justify-center sm:justify-start" />
          <p className="mt-1 text-xs text-overlay/40">{reviews.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {breakdown.map((row) => (
            <div key={row.star} className="flex items-center gap-3 text-xs text-overlay/50">
              <span className="w-10">{row.star} star</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-overlay/10">
                <div
                  className="h-full bg-gold"
                  style={{ width: `${(row.count / total) * 100}%` }}
                />
              </div>
              <span className="w-6 text-right">{row.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <Button variant="secondary" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? "Cancel" : "Write a Review"}
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-md border border-overlay/10 p-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-overlay/60">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setDraftRating(star)}
                  aria-label={`Rate ${star} stars`}
                >
                  <StarRating rating={star <= draftRating ? 5 : 0} size={22} />
                </button>
              ))}
            </div>
          </div>
          <input
            value={draftTitle}
            onChange={(e) => setDraftTitle(e.target.value)}
            placeholder="Review title"
            className="w-full rounded-sm border border-overlay/15 bg-overlay/[0.03] px-4 py-2.5 text-sm text-fg placeholder:text-overlay/35 focus:border-gold focus:outline-none"
          />
          <Textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="Share your experience with this fragrance..."
          />
          <Button type="submit">Submit Review</Button>
        </form>
      )}

      <div className="mt-10 space-y-8 divide-y divide-overlay/10">
        {reviews.map((review) => (
          <div key={review.id} className="pt-8 first:pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-fg">{review.author}</p>
                <StarRating rating={review.rating} className="mt-1" />
              </div>
              {review.verified && (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold">
                  <BadgeCheck size={13} /> Verified Buyer
                </span>
              )}
            </div>
            <h4 className="mt-3 font-serif text-base text-fg">{review.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-overlay/60">{review.content}</p>
            <p className="mt-3 text-xs text-overlay/30">{formatDate(review.date)}</p>
            {review.replies?.map((reply, i) => (
              <div key={i} className="mt-3 rounded-sm border border-gold/20 bg-gold/5 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gold">{reply.author}</p>
                <p className="mt-1 text-sm text-overlay/70">{reply.content}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

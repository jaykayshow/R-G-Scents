"use client";

import { useState } from "react";
import { Review } from "@/types";
import { StarRating } from "@/components/ui/star-rating";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useToastStore } from "@/lib/store/toast-store";
import { BadgeCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

export function ReviewSection({
  reviews,
  averageRating,
}: {
  reviews: Review[];
  averageRating: number;
}) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [showForm, setShowForm] = useState(false);
  const [draftRating, setDraftRating] = useState(5);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContent, setDraftContent] = useState("");
  const showToast = useToastStore((s) => s.show);

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: localReviews.filter((r) => Math.round(r.rating) === star).length,
  }));
  const total = localReviews.length || 1;

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
    };
    setLocalReviews((prev) => [newReview, ...prev]);
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
          <p className="font-serif text-5xl text-brand-white">{averageRating.toFixed(1)}</p>
          <StarRating rating={averageRating} size={16} className="mt-2 justify-center sm:justify-start" />
          <p className="mt-1 text-xs text-white/40">{localReviews.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {breakdown.map((row) => (
            <div key={row.star} className="flex items-center gap-3 text-xs text-white/50">
              <span className="w-10">{row.star} star</span>
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
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
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded-md border border-white/10 p-6">
          <div>
            <p className="mb-2 text-xs uppercase tracking-widest text-white/60">Your Rating</p>
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
            className="w-full rounded-sm border border-white/15 bg-white/[0.03] px-4 py-2.5 text-sm text-brand-white placeholder:text-white/35 focus:border-gold focus:outline-none"
          />
          <Textarea
            value={draftContent}
            onChange={(e) => setDraftContent(e.target.value)}
            placeholder="Share your experience with this fragrance..."
          />
          <Button type="submit">Submit Review</Button>
        </form>
      )}

      <div className="mt-10 space-y-8 divide-y divide-white/10">
        {localReviews.map((review) => (
          <div key={review.id} className="pt-8 first:pt-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-brand-white">{review.author}</p>
                <StarRating rating={review.rating} className="mt-1" />
              </div>
              {review.verified && (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold">
                  <BadgeCheck size={13} /> Verified Buyer
                </span>
              )}
            </div>
            <h4 className="mt-3 font-serif text-base text-brand-white">{review.title}</h4>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{review.content}</p>
            <p className="mt-3 text-xs text-white/30">{formatDate(review.date)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

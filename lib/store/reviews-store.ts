import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Review, ReviewStatus } from "@/types";
import { reviews as seedReviews } from "@/lib/mock-data/reviews";

interface ReviewsState {
  reviews: Review[];
  addReview: (review: Review) => void;
  setStatus: (id: string, status: ReviewStatus) => void;
  reply: (id: string, content: string) => void;
  deleteReview: (id: string) => void;
  approvedForProduct: (productId: string) => Review[];
}

export const useReviewsStore = create<ReviewsState>()(
  persist(
    (set, get) => ({
      reviews: seedReviews,
      addReview: (review) => set((state) => ({ reviews: [review, ...state.reviews] })),
      setStatus: (id, status) =>
        set((state) => ({ reviews: state.reviews.map((r) => (r.id === id ? { ...r, status } : r)) })),
      reply: (id, content) =>
        set((state) => ({
          reviews: state.reviews.map((r) =>
            r.id === id
              ? { ...r, replies: [...(r.replies ?? []), { author: "R&G Scents Support", content, date: new Date().toISOString() }] }
              : r
          ),
        })),
      deleteReview: (id) => set((state) => ({ reviews: state.reviews.filter((r) => r.id !== id) })),
      approvedForProduct: (productId) =>
        get().reviews.filter((r) => r.productId === productId && r.status === "approved"),
    }),
    { name: "rg-scents-reviews" }
  )
);

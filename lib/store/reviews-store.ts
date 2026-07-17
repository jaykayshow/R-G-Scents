import { create } from "zustand";
import { Review, ReviewStatus } from "@/types";
import { apiClient } from "@/lib/api-client";

interface ReviewsState {
  reviews: Review[];
  loading: boolean;
  error: string | null;
  fetchApproved: () => Promise<void>;
  fetchAllForAdmin: () => Promise<void>;
  addReview: (input: { productId: string; rating: number; title: string; content: string }) => Promise<void>;
  setStatus: (id: string, status: ReviewStatus) => Promise<void>;
  reply: (id: string, content: string) => Promise<void>;
}

function upsert(reviews: Review[], review: Review): Review[] {
  const exists = reviews.some((r) => r.id === review.id);
  return exists ? reviews.map((r) => (r.id === review.id ? review : r)) : [review, ...reviews];
}

export const useReviewsStore = create<ReviewsState>()((set) => ({
  reviews: [],
  loading: false,
  error: null,

  fetchApproved: async () => {
    set({ loading: true, error: null });
    try {
      const reviews = await apiClient.reviews.listApproved();
      set({ reviews, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load reviews.", loading: false });
    }
  },

  fetchAllForAdmin: async () => {
    set({ loading: true, error: null });
    try {
      const reviews = await apiClient.adminReviews.list();
      set({ reviews, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load reviews.", loading: false });
    }
  },

  addReview: async (input) => {
    const review = await apiClient.reviews.create(input);
    set((state) => ({ reviews: [review, ...state.reviews] }));
  },

  setStatus: async (id, status) => {
    const updated = await apiClient.adminReviews.updateStatus(id, status);
    set((state) => ({ reviews: upsert(state.reviews, updated) }));
  },

  reply: async (id, content) => {
    const updated = await apiClient.adminReviews.reply(id, content);
    set((state) => ({ reviews: upsert(state.reviews, updated) }));
  },
}));

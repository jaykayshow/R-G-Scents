import { create } from "zustand";
import { RewardTransaction } from "@/types";
import { apiClient, ReferralEntry } from "@/lib/api-client";

interface RewardsState {
  transactions: RewardTransaction[];
  referrals: ReferralEntry[];
  loading: boolean;
  fetchTransactions: () => Promise<void>;
  fetchReferrals: () => Promise<void>;
}

export const useRewardsStore = create<RewardsState>()((set) => ({
  transactions: [],
  referrals: [],
  loading: false,

  fetchTransactions: async () => {
    set({ loading: true });
    try {
      const transactions = await apiClient.rewards.transactions();
      set({ transactions, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchReferrals: async () => {
    try {
      const referrals = await apiClient.referrals.list();
      set({ referrals });
    } catch {
      // leave referrals as-is on failure
    }
  },
}));

import { create } from "zustand";
import { InventoryHistoryEntry } from "@/types";
import { apiClient } from "@/lib/api-client";

interface InventoryHistoryState {
  history: InventoryHistoryEntry[];
  loading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
}

export const useInventoryHistoryStore = create<InventoryHistoryState>()((set) => ({
  history: [],
  loading: false,
  error: null,

  fetchHistory: async () => {
    set({ loading: true, error: null });
    try {
      const history = await apiClient.inventory.history();
      set({ history, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load inventory history.", loading: false });
    }
  },
}));

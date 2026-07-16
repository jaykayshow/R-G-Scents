import { create } from "zustand";
import { persist } from "zustand/middleware";
import { InventoryHistoryEntry } from "@/types";
import { inventoryHistory as seedHistory } from "@/lib/mock-data/inventory-history";

interface InventoryHistoryState {
  history: InventoryHistoryEntry[];
  log: (entry: Omit<InventoryHistoryEntry, "id" | "date">) => void;
}

export const useInventoryHistoryStore = create<InventoryHistoryState>()(
  persist(
    (set) => ({
      history: seedHistory,
      log: (entry) =>
        set((state) => ({
          history: [
            { ...entry, id: `ih-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, date: new Date().toISOString() },
            ...state.history,
          ],
        })),
    }),
    { name: "rg-scents-inventory-history" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AuditLogEntry } from "@/types";
import { auditLogs as seedLogs } from "@/lib/mock-data/audit-logs";

interface AuditLogState {
  logs: AuditLogEntry[];
  log: (entry: Omit<AuditLogEntry, "id" | "date">) => void;
}

export const useAuditLogStore = create<AuditLogState>()(
  persist(
    (set) => ({
      logs: seedLogs,
      log: (entry) =>
        set((state) => ({
          logs: [
            { ...entry, id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, date: new Date().toISOString() },
            ...state.logs,
          ],
        })),
    }),
    { name: "rg-scents-audit-logs" }
  )
);

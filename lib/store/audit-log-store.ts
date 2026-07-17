import { create } from "zustand";
import { AuditLogEntry } from "@/types";
import { apiClient } from "@/lib/api-client";

interface AuditLogState {
  logs: AuditLogEntry[];
  loading: boolean;
  fetchLogs: () => Promise<void>;
}

export const useAuditLogStore = create<AuditLogState>()((set) => ({
  logs: [],
  loading: false,

  fetchLogs: async () => {
    set({ loading: true });
    try {
      const logs = await apiClient.auditLogs.list();
      set({ logs, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));

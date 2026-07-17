import { create } from "zustand";
import { SupportTicket } from "@/types";
import { apiClient } from "@/lib/api-client";

interface SupportState {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  fetchTickets: () => Promise<void>;
  fetchTicket: (id: string) => Promise<SupportTicket | undefined>;
  addTicket: (input: { category: string; subject: string; message: string }) => Promise<SupportTicket>;
  reply: (ticketId: string, content: string) => Promise<void>;
}

function upsert(tickets: SupportTicket[], ticket: SupportTicket): SupportTicket[] {
  const exists = tickets.some((t) => t.id === ticket.id);
  return exists ? tickets.map((t) => (t.id === ticket.id ? ticket : t)) : [ticket, ...tickets];
}

export const useSupportStore = create<SupportState>()((set, get) => ({
  tickets: [],
  loading: false,
  error: null,

  fetchTickets: async () => {
    set({ loading: true, error: null });
    try {
      const tickets = await apiClient.supportTickets.list();
      set({ tickets, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load support tickets.", loading: false });
    }
  },

  fetchTicket: async (id) => {
    try {
      const ticket = await apiClient.supportTickets.byId(id);
      set((state) => ({ tickets: upsert(state.tickets, ticket) }));
      return ticket;
    } catch {
      return get().tickets.find((t) => t.id === id);
    }
  },

  addTicket: async (input) => {
    const ticket = await apiClient.supportTickets.create(input);
    set((state) => ({ tickets: [ticket, ...state.tickets] }));
    return ticket;
  },

  reply: async (ticketId, content) => {
    const updated = await apiClient.supportTickets.reply(ticketId, content);
    set((state) => ({ tickets: upsert(state.tickets, updated) }));
  },
}));

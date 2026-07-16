import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SupportTicket } from "@/types";
import { mockSupportTickets } from "@/lib/mock-data/misc";

interface SupportState {
  tickets: SupportTicket[];
  addTicket: (ticket: Omit<SupportTicket, "id" | "createdAt" | "status">) => SupportTicket;
  reply: (ticketId: string, content: string) => void;
}

export const useSupportStore = create<SupportState>()(
  persist(
    (set) => ({
      tickets: mockSupportTickets,
      addTicket: (ticket) => {
        const newTicket: SupportTicket = {
          ...ticket,
          id: `s-${Date.now()}`,
          status: "Open",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tickets: [newTicket, ...state.tickets] }));
        return newTicket;
      },
      reply: (ticketId, content) => {
        set((state) => ({
          tickets: state.tickets.map((t) =>
            t.id === ticketId
              ? {
                  ...t,
                  status: "Awaiting Reply" as const,
                  messages: [...t.messages, { author: "customer" as const, content, date: new Date().toISOString() }],
                }
              : t
          ),
        }));
      },
    }),
    { name: "rg-scents-support" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Customer } from "@/types";
import { customers as seedCustomers } from "@/lib/mock-data/customers";

interface CustomersState {
  customers: Customer[];
  toggleStatus: (id: string) => void;
  setNotes: (id: string, notes: string) => void;
  getById: (id: string) => Customer | undefined;
}

export const useCustomersStore = create<CustomersState>()(
  persist(
    (set, get) => ({
      customers: seedCustomers,
      toggleStatus: (id) =>
        set((state) => ({
          customers: state.customers.map((c) =>
            c.id === id ? { ...c, status: c.status === "Active" ? "Suspended" : "Active" } : c
          ),
        })),
      setNotes: (id, notes) =>
        set((state) => ({ customers: state.customers.map((c) => (c.id === id ? { ...c, notes } : c)) })),
      getById: (id) => get().customers.find((c) => c.id === id),
    }),
    { name: "rg-scents-customers" }
  )
);

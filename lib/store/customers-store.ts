import { create } from "zustand";
import { Customer } from "@/types";
import { apiClient } from "@/lib/api-client";

interface CustomersState {
  customers: Customer[];
  loading: boolean;
  fetchCustomers: () => Promise<void>;
  fetchCustomer: (id: string) => Promise<Customer | undefined>;
  toggleStatus: (id: string) => Promise<void>;
  setNotes: (id: string, notes: string) => Promise<void>;
  getById: (id: string) => Customer | undefined;
}

function upsert(customers: Customer[], customer: Customer): Customer[] {
  const exists = customers.some((c) => c.id === customer.id);
  return exists ? customers.map((c) => (c.id === customer.id ? customer : c)) : [customer, ...customers];
}

export const useCustomersStore = create<CustomersState>()((set, get) => ({
  customers: [],
  loading: false,

  fetchCustomers: async () => {
    set({ loading: true });
    try {
      const customers = await apiClient.adminCustomers.list();
      set({ customers, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchCustomer: async (id) => {
    try {
      const customer = await apiClient.adminCustomers.byId(id);
      set((state) => ({ customers: upsert(state.customers, customer) }));
      return customer;
    } catch {
      return undefined;
    }
  },

  toggleStatus: async (id) => {
    const updated = await apiClient.adminCustomers.toggleStatus(id);
    set((state) => ({ customers: upsert(state.customers, updated) }));
  },

  setNotes: async (id, notes) => {
    const updated = await apiClient.adminCustomers.updateNotes(id, notes);
    set((state) => ({ customers: upsert(state.customers, updated) }));
  },

  getById: (id) => get().customers.find((c) => c.id === id),
}));

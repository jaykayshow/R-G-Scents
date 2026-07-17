import { create } from "zustand";
import { Address } from "@/types";
import { apiClient } from "@/lib/api-client";

interface AddressesState {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  fetchAddresses: () => Promise<void>;
  addAddress: (input: Omit<Address, "id" | "isDefault">) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  setDefault: (id: string) => Promise<void>;
}

export const useAddressesStore = create<AddressesState>()((set) => ({
  addresses: [],
  loading: false,
  error: null,

  fetchAddresses: async () => {
    set({ loading: true, error: null });
    try {
      const addresses = await apiClient.addresses.list();
      set({ addresses, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load addresses.", loading: false });
    }
  },

  addAddress: async (input) => {
    const created = await apiClient.addresses.create(input);
    set((state) => ({ addresses: [...state.addresses, created] }));
  },

  removeAddress: async (id) => {
    await apiClient.addresses.delete(id);
    set((state) => ({ addresses: state.addresses.filter((a) => a.id !== id) }));
  },

  setDefault: async (id) => {
    const addresses = await apiClient.addresses.setDefault(id);
    set({ addresses });
  },
}));

import { create } from "zustand";
import { AdminRole } from "@/types";
import { apiClient, ApiError, AdminSession, CreateAdminUserInput } from "@/lib/api-client";

export type { AdminSession };

interface AdminAuthState {
  currentAdmin: AdminSession | null;
  checked: boolean;
  loading: boolean;
  fetchMe: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;

  admins: AdminSession[];
  adminsLoading: boolean;
  fetchAdmins: () => Promise<void>;
  addAdmin: (admin: CreateAdminUserInput) => Promise<{ success: boolean; message: string }>;
  updateAdminRole: (id: string, role: AdminRole) => Promise<void>;
  toggleActive: (id: string) => Promise<void>;
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export const useAdminAuthStore = create<AdminAuthState>()((set) => ({
  currentAdmin: null,
  checked: false,
  loading: false,

  fetchMe: async () => {
    try {
      const admin = await apiClient.adminAuth.me();
      set({ currentAdmin: admin, checked: true });
    } catch {
      set({ currentAdmin: null, checked: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const admin = await apiClient.adminAuth.login(email, password);
      set({ currentAdmin: admin, checked: true, loading: false });
      return { success: true, message: `Welcome back, ${admin.name.split(" ")[0]}.` };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: errorMessage(err, "Invalid email or password.") };
    }
  },

  logout: async () => {
    try {
      await apiClient.adminAuth.logout();
    } finally {
      set({ currentAdmin: null });
    }
  },

  admins: [],
  adminsLoading: false,

  fetchAdmins: async () => {
    set({ adminsLoading: true });
    try {
      const admins = await apiClient.adminUsers.list();
      set({ admins, adminsLoading: false });
    } catch {
      set({ adminsLoading: false });
    }
  },

  addAdmin: async (input) => {
    try {
      const created = await apiClient.adminUsers.create(input);
      set((state) => ({ admins: [...state.admins, created] }));
      return { success: true, message: "Admin account created." };
    } catch (err) {
      return { success: false, message: errorMessage(err, "Could not create admin account.") };
    }
  },

  updateAdminRole: async (id, role) => {
    const updated = await apiClient.adminUsers.updateRole(id, role);
    set((state) => ({ admins: state.admins.map((a) => (a.id === id ? updated : a)) }));
  },

  toggleActive: async (id) => {
    const updated = await apiClient.adminUsers.toggleActive(id);
    set((state) => ({ admins: state.admins.map((a) => (a.id === id ? updated : a)) }));
  },
}));

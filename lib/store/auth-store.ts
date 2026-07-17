import { create } from "zustand";
import { User } from "@/types";
import { apiClient, ApiError, NotificationPreferences } from "@/lib/api-client";

interface AuthState {
  currentUser: User | null;
  checked: boolean;
  loading: boolean;
  fetchMe: () => Promise<void>;
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; devVerificationToken?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string; devResetToken?: string }>;
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  updateNotificationPreferences: (patch: Partial<NotificationPreferences>) => Promise<void>;
  updateProfile: (data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }) => Promise<{ success: boolean; message: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  deleteAccount: () => Promise<{ success: boolean; message: string }>;
}

function errorMessage(err: unknown, fallback: string) {
  return err instanceof ApiError ? err.message : fallback;
}

export const useAuthStore = create<AuthState>()((set) => ({
  currentUser: null,
  checked: false,
  loading: false,

  fetchMe: async () => {
    try {
      const user = await apiClient.auth.me();
      set({ currentUser: user, checked: true });
    } catch {
      set({ currentUser: null, checked: true });
    }
  },

  register: async ({ firstName, lastName, email, password }) => {
    set({ loading: true });
    try {
      const { user, devVerificationToken } = await apiClient.auth.register({
        firstName,
        lastName,
        email,
        password,
      });
      set({ currentUser: user, checked: true, loading: false });
      return { success: true, message: "Account created. Please verify your email.", devVerificationToken };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: errorMessage(err, "Could not create account.") };
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const user = await apiClient.auth.login(email, password);
      set({ currentUser: user, checked: true, loading: false });
      return { success: true, message: "Welcome back." };
    } catch (err) {
      set({ loading: false });
      return { success: false, message: errorMessage(err, "Invalid email or password.") };
    }
  },

  logout: async () => {
    try {
      await apiClient.auth.logout();
    } finally {
      set({ currentUser: null });
    }
  },

  requestPasswordReset: async (email) => {
    try {
      const res = await apiClient.auth.forgotPassword(email);
      return { success: true, message: res.message, devResetToken: res.devResetToken };
    } catch (err) {
      return { success: false, message: errorMessage(err, "Could not send reset instructions.") };
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      const res = await apiClient.auth.resetPassword(token, newPassword);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: errorMessage(err, "Could not reset password.") };
    }
  },

  verifyEmail: async (token) => {
    try {
      const res = await apiClient.auth.verifyEmail(token);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: errorMessage(err, "Could not verify email.") };
    }
  },

  updateNotificationPreferences: async (patch) => {
    const user = await apiClient.notificationPreferences.update(patch);
    set({ currentUser: user });
  },

  updateProfile: async (data) => {
    try {
      const user = await apiClient.auth.updateProfile(data);
      set({ currentUser: user });
      return { success: true, message: "Profile updated successfully." };
    } catch (err) {
      return { success: false, message: errorMessage(err, "Could not update profile.") };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const res = await apiClient.auth.changePassword(currentPassword, newPassword);
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: errorMessage(err, "Could not change password.") };
    }
  },

  deleteAccount: async () => {
    try {
      const res = await apiClient.auth.deleteAccount();
      set({ currentUser: null });
      return { success: true, message: res.message };
    } catch (err) {
      return { success: false, message: errorMessage(err, "Could not delete account.") };
    }
  },
}));

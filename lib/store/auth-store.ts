import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User } from "@/types";
import { mockUser } from "@/lib/mock-data/misc";

interface RegisteredAccount {
  email: string;
  password: string;
  user: User;
}

interface AuthState {
  currentUser: User | null;
  accounts: RegisteredAccount[];
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => { success: boolean; message: string };
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  requestPasswordReset: (email: string) => { success: boolean; message: string };
  resetPassword: (email: string, newPassword: string) => { success: boolean; message: string };
  verifyEmail: (email: string) => void;
}

const seedAccounts: RegisteredAccount[] = [
  { email: mockUser.email, password: "Billionaire123!", user: mockUser },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      accounts: seedAccounts,
      register: ({ firstName, lastName, email, password }) => {
        const exists = get().accounts.some(
          (a) => a.email.toLowerCase() === email.toLowerCase()
        );
        if (exists) {
          return { success: false, message: "An account with this email already exists." };
        }
        const newUser: User = {
          id: `u-${Date.now()}`,
          firstName,
          lastName,
          email,
          emailVerified: false,
          createdAt: new Date().toISOString(),
          rewardPoints: 0,
          referralCode: `${firstName.toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        };
        set((state) => ({
          accounts: [...state.accounts, { email, password, user: newUser }],
          currentUser: newUser,
        }));
        return { success: true, message: "Account created. Please verify your email." };
      },
      login: (email, password) => {
        const account = get().accounts.find(
          (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
        );
        if (!account) {
          return { success: false, message: "Invalid email or password." };
        }
        set({ currentUser: account.user });
        return { success: true, message: "Welcome back." };
      },
      logout: () => set({ currentUser: null }),
      requestPasswordReset: (email) => {
        const exists = get().accounts.some((a) => a.email.toLowerCase() === email.toLowerCase());
        if (!exists) {
          return { success: false, message: "No account found with that email." };
        }
        return { success: true, message: "Password reset instructions sent to your email." };
      },
      resetPassword: (email, newPassword) => {
        const found = get().accounts.some((a) => a.email.toLowerCase() === email.toLowerCase());
        if (!found) {
          return { success: false, message: "No account found with that email." };
        }
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.email.toLowerCase() === email.toLowerCase() ? { ...a, password: newPassword } : a
          ),
        }));
        return { success: true, message: "Password updated successfully." };
      },
      verifyEmail: (email) => {
        set((state) => ({
          accounts: state.accounts.map((a) =>
            a.email.toLowerCase() === email.toLowerCase()
              ? { ...a, user: { ...a.user, emailVerified: true } }
              : a
          ),
          currentUser:
            state.currentUser && state.currentUser.email.toLowerCase() === email.toLowerCase()
              ? { ...state.currentUser, emailVerified: true }
              : state.currentUser,
        }));
      },
    }),
    { name: "rg-scents-auth" }
  )
);

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AdminAccount, AdminRole } from "@/types";

export type AdminSession = Omit<AdminAccount, "password">;

const seedAdmins: AdminAccount[] = [
  {
    id: "adm-1",
    name: "Rita Green",
    email: "superadmin@rgscents.com",
    password: "Billionaire123!",
    role: "Super Admin",
    active: true,
    createdAt: "2026-01-01",
  },
  {
    id: "adm-2",
    name: "Tobi Adeyemi",
    email: "admin@rgscents.com",
    password: "Admin123!",
    role: "Admin",
    active: true,
    createdAt: "2026-02-10",
  },
  {
    id: "adm-3",
    name: "Ngozi Bello",
    email: "support@rgscents.com",
    password: "Support123!",
    role: "Support",
    active: true,
    createdAt: "2026-03-05",
  },
  {
    id: "adm-4",
    name: "Kunle Bassey",
    email: "editor@rgscents.com",
    password: "Editor123!",
    role: "Content Editor",
    active: true,
    createdAt: "2026-03-18",
  },
];

interface AdminAuthState {
  admins: AdminAccount[];
  currentAdmin: AdminSession | null;
  login: (email: string, password: string) => { success: boolean; message: string };
  logout: () => void;
  addAdmin: (admin: {
    name: string;
    email: string;
    password: string;
    role: AdminRole;
  }) => { success: boolean; message: string };
  updateAdmin: (id: string, patch: Partial<AdminAccount>) => void;
  deleteAdmin: (id: string) => void;
  toggleActive: (id: string) => void;
}

function toSession(account: AdminAccount): AdminSession {
  const { password: _password, ...session } = account;
  void _password;
  return session;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set, get) => ({
      admins: seedAdmins,
      currentAdmin: null,
      login: (email, password) => {
        const account = get().admins.find(
          (a) => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
        );
        if (!account) {
          return { success: false, message: "Invalid email or password." };
        }
        if (!account.active) {
          return { success: false, message: "This admin account has been deactivated." };
        }
        const now = new Date().toISOString();
        set((state) => ({
          admins: state.admins.map((a) => (a.id === account.id ? { ...a, lastLogin: now } : a)),
          currentAdmin: toSession({ ...account, lastLogin: now }),
        }));
        return { success: true, message: `Welcome back, ${account.name.split(" ")[0]}.` };
      },
      logout: () => set({ currentAdmin: null }),
      addAdmin: ({ name, email, password, role }) => {
        const exists = get().admins.some((a) => a.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          return { success: false, message: "An admin account with this email already exists." };
        }
        const newAdmin: AdminAccount = {
          id: `adm-${Date.now()}`,
          name,
          email,
          password,
          role,
          active: true,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ admins: [...state.admins, newAdmin] }));
        return { success: true, message: "Admin account created." };
      },
      updateAdmin: (id, patch) =>
        set((state) => ({
          admins: state.admins.map((a) => (a.id === id ? { ...a, ...patch } : a)),
          currentAdmin:
            state.currentAdmin && state.currentAdmin.id === id
              ? { ...state.currentAdmin, ...patch }
              : state.currentAdmin,
        })),
      deleteAdmin: (id) => set((state) => ({ admins: state.admins.filter((a) => a.id !== id) })),
      toggleActive: (id) =>
        set((state) => ({
          admins: state.admins.map((a) => (a.id === id ? { ...a, active: !a.active } : a)),
        })),
    }),
    { name: "rg-scents-admin-auth" }
  )
);

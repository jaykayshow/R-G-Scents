"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ShieldCheck, Lock } from "lucide-react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { ThemeToggle } from "@/components/theme/theme-toggle";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type FormValues = z.infer<typeof schema>;

const demoAccounts = [
  { role: "Super Admin", email: "superadmin@rgscents.com", password: "Billionaire123!" },
  { role: "Admin", email: "admin@rgscents.com", password: "Admin123!" },
  { role: "Support", email: "support@rgscents.com", password: "Support123!" },
  { role: "Content Editor", email: "editor@rgscents.com", password: "Editor123!" },
];

export default function AdminLoginPage() {
  const router = useRouter();
  const login = useAdminAuthStore((s) => s.login);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const [serverError, setServerError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && currentAdmin) {
      router.replace("/admin");
    }
  }, [hydrated, currentAdmin, router]);

  function onSubmit(values: FormValues) {
    const result = login(values.email, values.password);
    if (!result.success) {
      setServerError(result.message);
      return;
    }
    router.push("/admin");
  }

  function fillDemo(email: string, password: string) {
    setValue("email", email);
    setValue("password", password);
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-bg px-4 py-16">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-gold/40 bg-gold/10">
            <ShieldCheck size={22} className="text-gold" />
          </div>
          <p className="font-serif text-xl font-bold text-fg">
            R&amp;G <span className="text-gold">SCENTS</span>
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.3em] text-overlay/40">Admin Portal</p>
        </div>

        <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-8">
          <h1 className="font-sans text-lg font-semibold text-fg">Sign in to the console</h1>
          <p className="mt-1 text-sm text-overlay/40">
            This is a separate authentication domain from the storefront — customer sessions have no
            effect here.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@rgscents.com" error={errors.email?.message} {...register("email")} />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
            </div>
            {serverError && <p className="text-xs text-red-400">{serverError}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              <Lock size={14} /> Sign In
            </Button>
          </form>
        </div>

        <div className="mt-6 rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-overlay/40">
            Demo Accounts (click to fill)
          </p>
          <div className="space-y-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => fillDemo(acc.email, acc.password)}
                className="flex w-full items-center justify-between rounded-sm border border-overlay/10 px-3 py-2 text-left text-xs transition-colors hover:border-gold/40"
              >
                <span className="text-overlay/70">{acc.role}</span>
                <span className="text-overlay/30">{acc.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

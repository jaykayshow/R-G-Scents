"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const resetPassword = useAuthStore((s) => s.resetPassword);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    const result = resetPassword(email, values.password);
    if (!result.success) {
      setServerError(result.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/auth/login"), 1800);
  }

  return (
    <AuthCard
      eyebrow="Account Recovery"
      title="Reset Password"
      description={email ? `Setting a new password for ${email}` : "Set a new password for your account."}
    >
      {done ? (
        <div className="text-center">
          <CheckCircle2 size={40} className="mx-auto text-gold" />
          <p className="mt-4 text-sm text-overlay/70">Password updated. Redirecting to sign in...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="password">New Password</Label>
            <Input id="password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />
          </div>
          {serverError && <p className="text-xs text-red-400">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Reset Password
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToastStore } from "@/lib/store/toast-store";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

type FormValues = z.infer<typeof schema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((s) => s.login);
  const showToast = useToastStore((s) => s.show);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    const result = await login(values.email, values.password);
    if (!result.success) {
      setServerError(result.message);
      return;
    }
    showToast(result.message);
    const redirect = searchParams.get("redirect") || "/account";
    router.push(redirect);
  }

  return (
    <AuthCard
      eyebrow="Welcome Back"
      title="Sign In"
      description="Access your orders, wishlist, and rewards."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-gold hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/auth/forgot-password" className="mb-2 text-xs text-gold hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input id="password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        </div>
        {serverError && <p className="text-xs text-red-400">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Sign In
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-overlay/10" />
        <span className="text-xs uppercase tracking-widest text-overlay/40">Or continue with</span>
        <span className="h-px flex-1 bg-overlay/10" />
      </div>

      <SocialLoginButtons />
    </AuthCard>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AuthCard } from "@/components/auth/auth-card";
import { SocialLoginButtons } from "@/components/auth/social-login-buttons";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToastStore } from "@/lib/store/toast-store";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required."),
    lastName: z.string().min(1, "Last name is required."),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
    agreeToTerms: z.boolean().refine((v) => v, "You must agree to the terms to continue."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const register_ = useAuthStore((s) => s.register);
  const showToast = useToastStore((s) => s.show);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    const result = register_({
      firstName: values.firstName,
      lastName: values.lastName,
      email: values.email,
      password: values.password,
    });
    if (!result.success) {
      setServerError(result.message);
      return;
    }
    showToast(result.message);
    router.push(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
  }

  return (
    <AuthCard
      eyebrow="Join The Collection"
      title="Create Your Account"
      description="Unlock rewards, order tracking, and early access to new fragrances."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/auth/login" className="text-gold hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" placeholder="Rita" error={errors.firstName?.message} {...register("firstName")} />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" placeholder="Green" error={errors.lastName?.message} {...register("lastName")} />
          </div>
        </div>
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="••••••••" error={errors.password?.message} {...register("password")} />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
        </div>
        <div>
          <label className="flex items-start gap-2.5 text-xs text-white/60">
            <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[#c9a24b]" {...register("agreeToTerms")} />
            I agree to the{" "}
            <Link href="/terms" className="text-gold hover:underline">Terms of Service</Link> and{" "}
            <Link href="/privacy" className="text-gold hover:underline">Privacy Policy</Link>.
          </label>
          {errors.agreeToTerms && <p className="mt-1.5 text-xs text-red-400">{errors.agreeToTerms.message}</p>}
        </div>
        {serverError && <p className="text-xs text-red-400">{serverError}</p>}
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          Create Account
        </Button>
      </form>

      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-widest text-white/40">Or continue with</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <SocialLoginButtons />
    </AuthCard>
  );
}

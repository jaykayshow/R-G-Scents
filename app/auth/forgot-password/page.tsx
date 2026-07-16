"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MailCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";

const schema = z.object({
  email: z.string().email("Enter a valid email address."),
});
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const requestPasswordReset = useAuthStore((s) => s.requestPasswordReset);
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState("");
  const [email, setEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    const result = requestPasswordReset(values.email);
    if (!result.success) {
      setServerError(result.message);
      return;
    }
    setEmail(values.email);
    setSent(true);
  }

  return (
    <AuthCard
      eyebrow="Account Recovery"
      title="Forgot Password"
      description="Enter your email and we'll send you a link to reset your password."
      footer={
        <Link href="/auth/login" className="text-gold hover:underline">
          Back to Sign In
        </Link>
      }
    >
      {sent ? (
        <div className="text-center">
          <MailCheck size={40} className="mx-auto text-gold" />
          <p className="mt-4 text-sm text-white/70">
            If an account exists for <span className="text-brand-white">{email}</span>, a reset link
            has been sent.
          </p>
          <Link
            href={`/auth/reset-password?email=${encodeURIComponent(email)}`}
            className="mt-6 inline-block text-xs uppercase tracking-widest text-gold hover:underline"
          >
            (Preview) Continue to Reset Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />
          </div>
          {serverError && <p className="text-xs text-red-400">{serverError}</p>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            Send Reset Link
          </Button>
        </form>
      )}
    </AuthCard>
  );
}

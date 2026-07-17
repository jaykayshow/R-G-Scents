"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MailCheck, ShieldCheck } from "lucide-react";
import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToastStore } from "@/lib/store/toast-store";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const verifyEmail = useAuthStore((s) => s.verifyEmail);
  const showToast = useToastStore((s) => s.show);
  const [verified, setVerified] = useState(false);
  const [serverError, setServerError] = useState("");

  async function handleVerify() {
    const result = await verifyEmail(token);
    if (!result.success) {
      setServerError(result.message);
      return;
    }
    setVerified(true);
    showToast("Email verified successfully.");
    setTimeout(() => router.push("/account"), 1500);
  }

  return (
    <AuthCard
      eyebrow="One Last Step"
      title="Verify Your Email"
      description={email ? `We sent a verification link to ${email}` : "Check your inbox for a verification link."}
      footer={
        <>
          Wrong email?{" "}
          <Link href="/auth/register" className="text-gold hover:underline">
            Go back
          </Link>
        </>
      }
    >
      <div className="text-center">
        {verified ? (
          <>
            <ShieldCheck size={40} className="mx-auto text-gold" />
            <p className="mt-4 text-sm text-overlay/70">
              Verified — welcome to R&amp;G Scents. Redirecting to your account...
            </p>
          </>
        ) : (
          <>
            <MailCheck size={40} className="mx-auto text-gold" />
            <p className="mt-4 text-sm leading-relaxed text-overlay/70">
              Click the link in your email to activate your account. In this preview environment, you
              can simulate that click below.
            </p>
            {serverError && <p className="mt-3 text-xs text-red-400">{serverError}</p>}
            <Button onClick={handleVerify} className="mt-6 w-full" disabled={!token}>
              Simulate Email Verification
            </Button>
          </>
        )}
      </div>
    </AuthCard>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}

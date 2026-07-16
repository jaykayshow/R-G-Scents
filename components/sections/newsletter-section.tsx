"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToastStore } from "@/lib/store/toast-store";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const showToast = useToastStore((s) => s.show);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError("");
    setSubmitted(true);
    showToast("You're on the list. Confirm via the email we just sent.");
  }

  return (
    <section className="relative overflow-hidden bg-bg py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,162,75,0.1),transparent_65%)]" />
      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
          Become a Billionaire Insider
        </span>
        <h2 className="mt-4 text-balance font-serif text-3xl font-semibold text-fg sm:text-4xl">
          Exclusive Launches. Private Discounts. First Access.
        </h2>
        <p className="mt-4 text-sm text-overlay/60 sm:text-base">
          Join the inner circle and be the first to know when a new fragrance drops.
        </p>

        {submitted ? (
          <p className="mt-8 text-gold">Thank you for joining — a confirmation email is on its way.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row">
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              error={error}
            />
            <Button type="submit" className="shrink-0">
              Join Now
            </Button>
          </form>
        )}
      </div>
    </section>
  );
}

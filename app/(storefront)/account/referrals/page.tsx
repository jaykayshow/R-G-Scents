"use client";

import { useEffect, useState } from "react";
import { Copy, Users, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRewardsStore } from "@/lib/store/rewards-store";
import { useToastStore } from "@/lib/store/toast-store";
import { formatDate } from "@/lib/utils";

export default function ReferralsPage() {
  const user = useAuthStore((s) => s.currentUser);
  const referrals = useRewardsStore((s) => s.referrals);
  const fetchReferrals = useRewardsStore((s) => s.fetchReferrals);
  const showToast = useToastStore((s) => s.show);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  if (!user) return null;

  const referralLink = `https://rgscents.com/r/${user.referralCode}`;

  function handleCopy() {
    navigator.clipboard?.writeText(referralLink).catch(() => {});
    setCopied(true);
    showToast("Referral link copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <h2 className="mb-2 font-serif text-xl text-fg">Refer a Friend, Earn Rewards</h2>
        <p className="mb-6 text-sm text-overlay/50">
          Share your link — you both get $25 in credit when they place their first order.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            readOnly
            value={referralLink}
            className="w-full rounded-sm border border-overlay/15 bg-overlay/[0.03] px-4 py-2.5 text-sm text-fg"
          />
          <Button onClick={handleCopy} className="shrink-0">
            {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Copied" : "Copy Link"}
          </Button>
        </div>
        <p className="mt-4 text-xs text-overlay/40">Your referral code: <span className="text-gold">{user.referralCode}</span></p>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold">
          <Users size={14} /> Your Referrals
        </h3>
        {referrals.length === 0 ? (
          <p className="text-sm text-overlay/50">No referrals yet — share your link to get started.</p>
        ) : (
          <div className="space-y-4">
            {referrals.map((ref, i) => (
              <div key={i} className="flex items-center justify-between border-b border-overlay/5 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm text-fg">{ref.name}</p>
                  <p className="text-xs text-overlay/40">{ref.status} · Joined {formatDate(ref.joinedAt)}</p>
                </div>
                <span className="text-sm text-gold">{ref.reward}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

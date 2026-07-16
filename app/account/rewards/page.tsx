"use client";

import { Gift, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth-store";
import { mockRewardTransactions } from "@/lib/mock-data/misc";
import { formatDate } from "@/lib/utils";

export default function RewardsPage() {
  const user = useAuthStore((s) => s.currentUser);
  if (!user) return null;

  return (
    <div className="space-y-8">
      <Card className="flex flex-col items-center gap-2 p-10 text-center">
        <Gift size={28} className="text-gold" />
        <p className="font-serif text-4xl text-brand-white">{user.rewardPoints.toLocaleString()}</p>
        <p className="text-xs uppercase tracking-widest text-white/50">Available Points</p>
        <p className="mt-2 text-xs text-white/40">≈ ${(user.rewardPoints / 20).toFixed(2)} in redemption value</p>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">How It Works</h3>
        <ul className="space-y-2 text-sm text-white/60">
          <li>• Earn 1 point for every $1 spent on any order.</li>
          <li>• Redeem 200 points for $10 off at checkout.</li>
          <li>• Points are credited once an order is marked as Delivered.</li>
          <li>• VIP Insiders earn 1.5x points on all purchases.</li>
        </ul>
      </Card>

      <Card className="p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">Points History</h3>
        <div className="space-y-4">
          {mockRewardTransactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center gap-3">
                {tx.type === "earn" ? (
                  <TrendingUp size={16} className="text-gold" />
                ) : (
                  <TrendingDown size={16} className="text-white/40" />
                )}
                <div>
                  <p className="text-sm text-brand-white">{tx.description}</p>
                  <p className="text-xs text-white/40">{formatDate(tx.date)}</p>
                </div>
              </div>
              <span className={tx.type === "earn" ? "text-gold" : "text-white/50"}>
                {tx.type === "earn" ? "+" : ""}{tx.points}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

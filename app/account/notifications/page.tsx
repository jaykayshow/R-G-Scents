"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToastStore } from "@/lib/store/toast-store";

const initialPrefs = {
  orderUpdates: true,
  shippingAlerts: true,
  promotions: true,
  vipEarlyAccess: true,
  restockAlerts: false,
  productReviewRequests: true,
  accountSecurity: true,
};

const labels: Record<keyof typeof initialPrefs, { title: string; description: string }> = {
  orderUpdates: { title: "Order Updates", description: "Confirmation, processing, and delivery status." },
  shippingAlerts: { title: "Shipping Alerts", description: "Tracking updates from our courier partners." },
  promotions: { title: "Promotions & Discounts", description: "Sales, seasonal offers, and coupon codes." },
  vipEarlyAccess: { title: "VIP Early Access", description: "First access to limited edition drops." },
  restockAlerts: { title: "Restock Alerts", description: "Notify me when a wishlist item is back in stock." },
  productReviewRequests: { title: "Review Requests", description: "Reminders to review your recent purchases." },
  accountSecurity: { title: "Account & Security", description: "Password changes and login alerts (cannot be disabled)." },
};

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState(initialPrefs);
  const showToast = useToastStore((s) => s.show);

  function toggle(key: keyof typeof initialPrefs) {
    if (key === "accountSecurity") return;
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    showToast("Notification preferences updated.");
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-xl text-brand-white">Notification Preferences</h2>
      <Card className="divide-y divide-white/10">
        {(Object.keys(prefs) as (keyof typeof initialPrefs)[]).map((key) => (
          <div key={key} className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-brand-white">{labels[key].title}</p>
              <p className="text-xs text-white/40">{labels[key].description}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              disabled={key === "accountSecurity"}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
                prefs[key] ? "bg-gold" : "bg-white/15"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-matte-black transition-transform ${
                  prefs[key] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </Card>
    </div>
  );
}

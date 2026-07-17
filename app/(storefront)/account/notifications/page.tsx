"use client";

import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/lib/store/auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { NotificationPreferences, ApiError } from "@/lib/api-client";

const labels: Record<keyof NotificationPreferences, { title: string; description: string }> = {
  notifyOrderUpdates: { title: "Order Updates", description: "Confirmation, processing, and delivery status." },
  notifyShippingAlerts: { title: "Shipping Alerts", description: "Tracking updates from our courier partners." },
  notifyPromotions: { title: "Promotions & Discounts", description: "Sales, seasonal offers, and coupon codes." },
  notifyVipEarlyAccess: { title: "VIP Early Access", description: "First access to limited edition drops." },
  notifyRestockAlerts: { title: "Restock Alerts", description: "Notify me when a wishlist item is back in stock." },
  notifyReviewRequests: { title: "Review Requests", description: "Reminders to review your recent purchases." },
};

const keys = Object.keys(labels) as (keyof NotificationPreferences)[];

export default function NotificationsPage() {
  const currentUser = useAuthStore((s) => s.currentUser);
  const updateNotificationPreferences = useAuthStore((s) => s.updateNotificationPreferences);
  const showToast = useToastStore((s) => s.show);

  if (!currentUser) return null;

  async function toggle(key: keyof NotificationPreferences) {
    try {
      await updateNotificationPreferences({ [key]: !currentUser![key] });
      showToast("Notification preferences updated.");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not update preferences.", "error");
    }
  }

  return (
    <div>
      <h2 className="mb-6 font-serif text-xl text-fg">Notification Preferences</h2>
      <Card className="divide-y divide-overlay/10">
        {keys.map((key) => (
          <div key={key} className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm font-medium text-fg">{labels[key].title}</p>
              <p className="text-xs text-overlay/40">{labels[key].description}</p>
            </div>
            <button
              onClick={() => toggle(key)}
              className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
                currentUser[key] ? "bg-gold" : "bg-overlay/20"
              }`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  currentUser[key] ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium text-fg">Account & Security</p>
            <p className="text-xs text-overlay/40">Password changes and login alerts (cannot be disabled).</p>
          </div>
          <button disabled className="relative h-6 w-11 shrink-0 rounded-full bg-gold opacity-50">
            <span className="absolute top-0.5 h-5 w-5 translate-x-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>
      </Card>
    </div>
  );
}

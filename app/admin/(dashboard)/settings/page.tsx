"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { useSettingsStore } from "@/lib/store/settings-store";
import { useToastStore } from "@/lib/store/toast-store";
import { SiteSettings } from "@/types";
import { ApiError } from "@/lib/api-client";

export default function AdminSettingsPage() {
  const settings = useSettingsStore((s) => s.settings);
  const fetchSettings = useSettingsStore((s) => s.fetchSettings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const [draft, setDraft] = useState<SiteSettings>(settings);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  async function handleSave(section: string) {
    try {
      await updateSettings(draft, section);
      showToast(`${section} settings saved.`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not save settings.", "error");
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Settings" description="Store-wide configuration for tax, shipping, payments, and SEO." />

      <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">General</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="siteName">Site Name</Label>
            <Input id="siteName" value={draft.siteName} onChange={(e) => setDraft((d) => ({ ...d, siteName: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="supportEmail">Support Email</Label>
            <Input id="supportEmail" value={draft.supportEmail} onChange={(e) => setDraft((d) => ({ ...d, supportEmail: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="supportPhone">Support Phone</Label>
            <Input id="supportPhone" value={draft.supportPhone} onChange={(e) => setDraft((d) => ({ ...d, supportPhone: e.target.value }))} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm text-overlay/70">
              <input
                type="checkbox"
                checked={draft.maintenanceMode}
                onChange={(e) => setDraft((d) => ({ ...d, maintenanceMode: e.target.checked }))}
                className="h-4 w-4 accent-[#c9a24b]"
              />
              Maintenance Mode
            </label>
          </div>
        </div>
        <Button size="sm" className="mt-4" onClick={() => handleSave("General")}>
          <Save size={13} /> Save General Settings
        </Button>
      </section>

      <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Tax &amp; Shipping</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="taxRate">Tax Rate (%)</Label>
            <Input
              id="taxRate"
              type="number"
              value={draft.taxRatePercent}
              onChange={(e) => setDraft((d) => ({ ...d, taxRatePercent: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="flatShipping">Flat Shipping Rate ($)</Label>
            <Input
              id="flatShipping"
              type="number"
              value={draft.flatShippingRate}
              onChange={(e) => setDraft((d) => ({ ...d, flatShippingRate: Number(e.target.value) }))}
            />
          </div>
          <div>
            <Label htmlFor="freeShipping">Free Shipping Threshold ($)</Label>
            <Input
              id="freeShipping"
              type="number"
              value={draft.freeShippingThreshold}
              onChange={(e) => setDraft((d) => ({ ...d, freeShippingThreshold: Number(e.target.value) }))}
            />
          </div>
        </div>
        <p className="mt-3 text-xs text-overlay/30">
          These values directly control checkout totals on the storefront in real time.
        </p>
        <Button size="sm" className="mt-4" onClick={() => handleSave("Tax & Shipping")}>
          <Save size={13} /> Save Tax &amp; Shipping
        </Button>
      </section>

      <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Payment Gateways</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {(
            [
              ["stripeEnabled", "Stripe"],
              ["paystackEnabled", "Paystack"],
              ["flutterwaveEnabled", "Flutterwave"],
              ["paypalEnabled", "PayPal"],
              ["bankTransferEnabled", "Bank Transfer"],
              ["codEnabled", "Cash on Delivery"],
            ] as [keyof SiteSettings, string][]
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-overlay/70">
              <input
                type="checkbox"
                checked={Boolean(draft[key])}
                onChange={(e) => setDraft((d) => ({ ...d, [key]: e.target.checked }))}
                className="h-4 w-4 accent-[#c9a24b]"
              />
              {label}
            </label>
          ))}
        </div>
        <Button size="sm" className="mt-4" onClick={() => handleSave("Payment Gateway")}>
          <Save size={13} /> Save Payment Settings
        </Button>
      </section>

      <section className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">SEO Defaults</h2>
        <div className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Default Meta Title</Label>
            <Input id="metaTitle" value={draft.metaTitle} onChange={(e) => setDraft((d) => ({ ...d, metaTitle: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="metaDescription">Default Meta Description</Label>
            <Textarea id="metaDescription" value={draft.metaDescription} onChange={(e) => setDraft((d) => ({ ...d, metaDescription: e.target.value }))} />
          </div>
        </div>
        <Button size="sm" className="mt-4" onClick={() => handleSave("SEO")}>
          <Save size={13} /> Save SEO Settings
        </Button>
      </section>
    </div>
  );
}

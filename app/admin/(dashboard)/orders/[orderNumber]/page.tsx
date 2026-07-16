"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useOrdersStore } from "@/lib/store/orders-store";
import { useAuditLogStore } from "@/lib/store/audit-log-store";
import { useAdminAuthStore } from "@/lib/store/admin-auth-store";
import { useToastStore } from "@/lib/store/toast-store";
import { OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const orderStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

const statusVariant = (status: OrderStatus) =>
  status === "Delivered" ? "gold" : status === "Cancelled" || status === "Refunded" ? "danger" : "outline";

export default function AdminOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const order = useOrdersStore((s) => s.getByNumber(orderNumber));
  const updateStatus = useOrdersStore((s) => s.updateStatus);
  const setTrackingNumber = useOrdersStore((s) => s.setTrackingNumber);
  const log = useAuditLogStore((s) => s.log);
  const currentAdmin = useAdminAuthStore((s) => s.currentAdmin);
  const showToast = useToastStore((s) => s.show);

  const [trackingInput, setTrackingInput] = useState(order?.trackingNumber ?? "");

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-white/50">Order not found.</p>
        <Link href="/admin/orders" className="text-xs text-gold hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  function handleStatusChange(status: OrderStatus) {
    updateStatus(orderNumber, status);
    log({ actor: currentAdmin?.name ?? "Admin", action: `Changed order status to ${status}`, target: orderNumber, category: "Order" });
    showToast(`Order ${orderNumber} marked as ${status}.`);
  }

  function handleSaveTracking() {
    setTrackingNumber(orderNumber, trackingInput.trim());
    log({ actor: currentAdmin?.name ?? "Admin", action: "Updated tracking number", target: `${orderNumber} — ${trackingInput.trim()}`, category: "Order" });
    showToast("Tracking number saved.");
  }

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-xs text-white/40 hover:text-gold">
        <ArrowLeft size={13} /> Back to Orders
      </Link>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${formatDate(order.date)} · ${order.paymentMethod}`}
        actions={<Badge variant={statusVariant(order.status)}>{order.status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-white/5">
                    <Image src={item.image} alt={item.productName} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-brand-white">{item.productName}</p>
                    <p className="text-xs text-white/40">{item.variantSize} × {item.quantity}</p>
                  </div>
                  <span className="text-sm text-white/80">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-white/60"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-white/60"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span></div>
              <div className="flex justify-between text-white/60"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gold"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>
              )}
              <div className="flex justify-between border-t border-white/10 pt-2 font-serif text-lg text-brand-white">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">Shipping Address</h2>
            <p className="text-sm text-white/70">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}<br />
              {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.phone}
            </p>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">Tracking Timeline</h2>
            <div className="space-y-3">
              {order.trackingEvents.map((event, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-white/70">{event.status} — {event.note}</span>
                  <span className="text-white/30">{formatDate(event.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/50">Update Status</h2>
            <Select value={order.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-white/50">
              <Truck size={14} /> Tracking Number
            </h2>
            <Label htmlFor="tracking">Courier Tracking Number</Label>
            <Input id="tracking" value={trackingInput} onChange={(e) => setTrackingInput(e.target.value)} placeholder="RG-TRK-XXXXX" />
            <Button size="sm" className="mt-3 w-full" onClick={handleSaveTracking}>
              Save Tracking Number
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

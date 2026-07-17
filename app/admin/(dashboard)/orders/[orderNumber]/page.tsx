"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Truck } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { useOrdersStore } from "@/lib/store/orders-store";
import { useToastStore } from "@/lib/store/toast-store";
import { OrderStatus } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

const orderStatuses: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled", "Refunded"];

const statusVariant = (status: OrderStatus) =>
  status === "Delivered" ? "gold" : status === "Cancelled" || status === "Refunded" ? "danger" : "outline";

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const order = useOrdersStore((s) => s.getByNumber(orderNumber));
  const fetchAllForAdmin = useOrdersStore((s) => s.fetchAllForAdmin);
  const updateStatus = useOrdersStore((s) => s.updateStatus);
  const setTrackingNumber = useOrdersStore((s) => s.setTrackingNumber);
  const showToast = useToastStore((s) => s.show);

  const [trackingInput, setTrackingInput] = useState(order?.trackingNumber ?? "");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (order) {
      setChecked(true);
      return;
    }
    fetchAllForAdmin().finally(() => setChecked(true));
  }, [order, fetchAllForAdmin]);

  useEffect(() => {
    if (order?.trackingNumber) setTrackingInput(order.trackingNumber);
  }, [order?.trackingNumber]);

  if (!checked) return <div className="min-h-[40vh]" />;

  if (!order) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-overlay/50">Order not found.</p>
        <Link href="/admin/orders" className="text-xs text-gold hover:underline">
          &larr; Back to Orders
        </Link>
      </div>
    );
  }

  async function handleStatusChange(status: OrderStatus) {
    try {
      await updateStatus(orderNumber, status);
      showToast(`Order ${orderNumber} marked as ${status}.`);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleSaveTracking() {
    try {
      await setTrackingNumber(orderNumber, trackingInput.trim());
      showToast("Tracking number saved.");
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  return (
    <div>
      <Link href="/admin/orders" className="mb-4 inline-flex items-center gap-1.5 text-xs text-overlay/40 hover:text-gold">
        <ArrowLeft size={13} /> Back to Orders
      </Link>
      <AdminPageHeader
        title={order.orderNumber}
        description={`Placed ${formatDate(order.date)} · ${order.paymentMethod}`}
        actions={<Badge variant={statusVariant(order.status)}>{order.status}</Badge>}
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Items</h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.productId} className="flex items-center gap-4">
                  <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-overlay/5">
                    <Image src={item.image} alt={item.productName} fill className="object-contain p-2" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-fg">{item.productName}</p>
                    <p className="text-xs text-overlay/40">{item.variantSize} × {item.quantity}</p>
                  </div>
                  <span className="text-sm text-overlay/80">{formatCurrency(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2 border-t border-overlay/10 pt-4 text-sm">
              <div className="flex justify-between text-overlay/60"><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
              <div className="flex justify-between text-overlay/60"><span>Shipping</span><span>{order.shipping === 0 ? "Free" : formatCurrency(order.shipping)}</span></div>
              <div className="flex justify-between text-overlay/60"><span>Tax</span><span>{formatCurrency(order.tax)}</span></div>
              {order.discount > 0 && (
                <div className="flex justify-between text-gold"><span>Discount</span><span>-{formatCurrency(order.discount)}</span></div>
              )}
              <div className="flex justify-between border-t border-overlay/10 pt-2 font-serif text-lg text-fg">
                <span>Total</span><span>{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Shipping Address</h2>
            <p className="text-sm text-overlay/70">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}<br />
              {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.phone}
            </p>
          </div>

          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Tracking Timeline</h2>
            <div className="space-y-3">
              {order.trackingEvents.map((event, i) => (
                <div key={i} className="flex justify-between text-xs">
                  <span className="text-overlay/70">{event.status} — {event.note}</span>
                  <span className="text-overlay/30">{formatDate(event.date)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Update Status</h2>
            <Select value={order.status} onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </Select>
          </div>

          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-overlay/50">
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

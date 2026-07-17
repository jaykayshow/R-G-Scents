"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Download } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { downloadInvoice } from "@/lib/invoice";
import { useCartStore } from "@/lib/store/cart-store";
import { useOrdersStore } from "@/lib/store/orders-store";
import { useProductsStore } from "@/lib/store/products-store";
import { useToastStore } from "@/lib/store/toast-store";
import { OrderStatus } from "@/types";

const statusFlow: OrderStatus[] = ["Pending", "Processing", "Shipped", "Delivered"];

export default function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params);
  const order = useOrdersStore((s) => s.getByNumber(orderNumber));
  const fetchByNumber = useOrdersStore((s) => s.fetchByNumber);
  const addItem = useCartStore((s) => s.addItem);
  const showToast = useToastStore((s) => s.show);
  const getProductBySlug = useProductsStore((s) => s.getBySlug);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (order) {
      setChecked(true);
      return;
    }
    fetchByNumber(orderNumber).finally(() => setChecked(true));
  }, [order, orderNumber, fetchByNumber]);

  if (!checked) return <div className="min-h-[60vh]" />;
  if (!order) notFound();

  const currentStepIndex = statusFlow.indexOf(order.status);

  function handleReorder() {
    order!.items.forEach((item) => {
      const product = getProductBySlug(item.productSlug);
      const variant = product?.variants.find((v) => v.size === item.variantSize) ?? product?.variants[0];
      if (!product || !variant) return;
      addItem({
        productId: product.id,
        variantId: variant.id,
        name: product.name,
        slug: product.slug,
        image: product.images[0],
        size: variant.size,
        price: variant.price,
        quantity: item.quantity,
        stock: variant.stock,
      });
    });
    showToast("Items from this order have been added to your cart.");
  }

  function handleDownloadInvoice() {
    downloadInvoice(order!);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-overlay/40">Order</p>
          <h2 className="font-serif text-2xl text-fg">{order.orderNumber}</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" size="sm" onClick={handleDownloadInvoice}>
            <Download size={14} /> Invoice
          </Button>
          <Button size="sm" onClick={handleReorder}>Reorder</Button>
        </div>
      </div>

      {order.status !== "Cancelled" && order.status !== "Refunded" && (
        <Card className="p-6">
          <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gold">Order Tracking</h3>
          <div className="flex items-center justify-between">
            {statusFlow.map((step, i) => (
              <div key={step} className="flex flex-1 flex-col items-center text-center">
                <div className="flex w-full items-center">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs",
                      i <= currentStepIndex ? "border-gold bg-gold text-ink" : "border-overlay/20 text-overlay/40"
                    )}
                  >
                    {i < currentStepIndex ? <Check size={14} /> : i + 1}
                  </div>
                  {i < statusFlow.length - 1 && (
                    <div className={cn("h-0.5 flex-1", i < currentStepIndex ? "bg-gold" : "bg-overlay/15")} />
                  )}
                </div>
                <p className={cn("mt-2 text-[11px]", i <= currentStepIndex ? "text-fg" : "text-overlay/40")}>
                  {step}
                </p>
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <p className="mt-6 text-xs text-overlay/50">
              Tracking Number: <span className="text-fg">{order.trackingNumber}</span>
            </p>
          )}
          <div className="mt-6 space-y-3 border-t border-overlay/10 pt-6">
            {order.trackingEvents.map((event, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-overlay/60">{event.note}</span>
                <span className="text-overlay/30">{formatDate(event.date)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">Items</h3>
        <div className="space-y-4">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-sm bg-overlay/5">
                <Image src={item.image} alt={item.productName} fill className="object-contain p-2" />
              </div>
              <div className="flex-1">
                <Link href={`/shop/${item.productSlug}`} className="text-sm text-fg hover:text-gold">
                  {item.productName}
                </Link>
                <p className="text-xs text-overlay/40">{item.variantSize} × {item.quantity}</p>
              </div>
              <span className="text-sm text-fg">{formatCurrency(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 space-y-2 border-t border-overlay/10 pt-6 text-sm">
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
      </Card>

      <Card className="p-6">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Shipping Address</h3>
        <p className="text-sm text-overlay/70">
          {order.shippingAddress.fullName}<br />
          {order.shippingAddress.line1}{order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}<br />
          {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country}<br />
          {order.shippingAddress.postalCode}<br />
          {order.shippingAddress.phone}
        </p>
        <p className="mt-4 text-xs text-overlay/40">Payment Method: {order.paymentMethod}</p>
      </Card>
    </div>
  );
}

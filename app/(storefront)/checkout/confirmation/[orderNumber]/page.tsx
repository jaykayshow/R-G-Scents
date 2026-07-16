"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Download, Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button, ButtonLink } from "@/components/ui/button";
import { useOrdersStore } from "@/lib/store/orders-store";
import { downloadInvoice } from "@/lib/invoice";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = use(params);
  const [hydrated, setHydrated] = useState(false);
  const order = useOrdersStore((s) => s.getByNumber(orderNumber));

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return <div className="min-h-[60vh]" />;
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <CheckCircle2 size={48} className="mx-auto text-gold" />
      <h1 className="mt-6 font-serif text-3xl font-semibold text-brand-white sm:text-4xl">
        Thank You, Your Order Is Confirmed
      </h1>
      <p className="mt-3 text-sm text-white/60">
        Order <span className="text-brand-white">{order.orderNumber}</span> placed on {formatDate(order.date)}
      </p>
      <p className="mt-2 flex items-center justify-center gap-2 text-xs text-white/40">
        <Mail size={13} /> A confirmation email has been sent with your receipt.
      </p>

      <Card className="mt-10 p-6 text-left">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-gold">Order Summary</h3>
        <div className="space-y-3">
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-sm bg-white/5">
                <Image src={item.image} alt={item.productName} fill className="object-contain p-1.5" />
              </div>
              <div className="flex-1 text-sm">
                <Link href={`/shop/${item.productSlug}`} className="text-brand-white hover:text-gold">
                  {item.productName}
                </Link>
                <p className="text-xs text-white/40">{item.variantSize} × {item.quantity}</p>
              </div>
              <span className="text-sm text-brand-white">{formatCurrency(item.unitPrice * item.quantity)}</span>
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
      </Card>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Button variant="secondary" onClick={() => downloadInvoice(order)}>
          <Download size={14} /> Download Invoice
        </Button>
        <ButtonLink href={`/account/orders/${order.orderNumber}`}>Track Your Order</ButtonLink>
        <ButtonLink href="/shop" variant="outline-light">Continue Shopping</ButtonLink>
      </div>
    </div>
  );
}

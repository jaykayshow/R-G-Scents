"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Gift, Lock, ShoppingBag } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { CheckoutSteps } from "@/components/checkout/checkout-steps";
import { checkoutSchema, CheckoutValues, stepFields, paymentMethods } from "@/lib/checkout-schema";
import { useCartStore } from "@/lib/store/cart-store";
import { useAuthStore } from "@/lib/store/auth-store";
import { useOrdersStore } from "@/lib/store/orders-store";
import { useAddressesStore } from "@/lib/store/addresses-store";
import { useToastStore } from "@/lib/store/toast-store";
import { computeOrderTotals } from "@/lib/order-totals";
import { formatCurrency } from "@/lib/utils";
import { Price } from "@/components/ui/price";
import { ApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function CheckoutPage() {
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);
  const [step, setStep] = useState(0);

  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const clearCart = useCartStore((s) => s.clear);
  const currentUser = useAuthStore((s) => s.currentUser);
  const createOrder = useOrdersStore((s) => s.createOrder);
  const addresses = useAddressesStore((s) => s.addresses);
  const fetchAddresses = useAddressesStore((s) => s.fetchAddresses);
  const showToast = useToastStore((s) => s.show);
  const [placingOrder, setPlacingOrder] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<CheckoutValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      guestEmail: currentUser?.email ?? "",
      shipFullName: "",
      shipLine1: "",
      shipLine2: "",
      shipCity: "",
      shipState: "",
      shipCountry: "Nigeria",
      shipPostalCode: "",
      shipPhone: "",
      billingSameAsShipping: true,
      paymentMethod: "card",
      giftWrap: false,
    },
  });

  const values = watch();
  const totals = computeOrderTotals(subtotal, appliedCoupon);

  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (currentUser) fetchAddresses();
  }, [currentUser, fetchAddresses]);

  useEffect(() => {
    const defaultAddress = addresses.find((a) => a.isDefault);
    if (currentUser && defaultAddress) {
      reset({
        guestEmail: currentUser.email,
        shipFullName: defaultAddress.fullName,
        shipLine1: defaultAddress.line1,
        shipLine2: defaultAddress.line2 ?? "",
        shipCity: defaultAddress.city,
        shipState: defaultAddress.state,
        shipCountry: defaultAddress.country,
        shipPostalCode: defaultAddress.postalCode,
        shipPhone: defaultAddress.phone,
        billingSameAsShipping: true,
        paymentMethod: "card",
        giftWrap: false,
      });
    }
  }, [addresses, currentUser, reset]);

  async function goNext() {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((s) => Math.min(s + 1, 3));
  }

  function goBack() {
    setStep((s) => Math.max(s - 1, 0));
  }

  async function onSubmit(data: CheckoutValues) {
    const outOfStock = items.find((i) => i.quantity > i.stock);
    if (outOfStock) {
      showToast(`${outOfStock.name} only has ${outOfStock.stock} unit(s) left in stock.`, "error");
      setStep(3);
      return;
    }

    setPlacingOrder(true);
    try {
      const order = await createOrder({
        items: items.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
        guestEmail: currentUser ? undefined : data.guestEmail,
        shipFullName: data.shipFullName,
        shipLine1: data.shipLine1,
        shipLine2: data.shipLine2,
        shipCity: data.shipCity,
        shipState: data.shipState,
        shipCountry: data.shipCountry,
        shipPostalCode: data.shipPostalCode,
        shipPhone: data.shipPhone,
        paymentMethod: data.paymentMethod,
        giftWrap: data.giftWrap,
        giftMessage: data.giftMessage,
        couponCode: appliedCoupon?.code,
      });

      clearCart();
      showToast("Order placed successfully.");
      router.push(`/checkout/confirmation/${order.orderNumber}`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Could not place order. Please try again.", "error");
      setPlacingOrder(false);
    }
  }

  if (!hydrated) return <div className="min-h-[60vh]" />;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-32 text-center">
        <ShoppingBag size={40} className="text-overlay/20" />
        <h1 className="font-serif text-3xl text-fg">Your Bag is Empty</h1>
        <p className="text-sm text-overlay/50">Add something to your bag before checking out.</p>
        <ButtonLink href="/shop">Shop the Collection</ButtonLink>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="mb-10 text-center font-serif text-3xl font-semibold text-fg sm:text-4xl">
        Checkout
      </h1>
      <CheckoutSteps current={step} />

      <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Step 0: Contact */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-serif text-xl text-fg">Contact Information</h2>
              {currentUser ? (
                <p className="text-sm text-overlay/60">
                  Signed in as <span className="text-fg">{currentUser.email}</span>.{" "}
                </p>
              ) : (
                <p className="text-sm text-overlay/60">
                  Checking out as a guest.{" "}
                  <Link href="/auth/login?redirect=/checkout" className="text-gold hover:underline">
                    Sign in
                  </Link>{" "}
                  for faster checkout and order tracking.
                </p>
              )}
              <div>
                <Label htmlFor="guestEmail">Email Address</Label>
                <Input
                  id="guestEmail"
                  type="email"
                  readOnly={!!currentUser}
                  error={errors.guestEmail?.message}
                  {...register("guestEmail")}
                />
              </div>
              <Button type="button" onClick={goNext} className="w-full">
                Continue to Shipping
              </Button>
            </div>
          )}

          {/* Step 1: Shipping + Billing */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <h2 className="mb-5 font-serif text-xl text-fg">Shipping Address</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="shipFullName">Full Name</Label>
                    <Input id="shipFullName" error={errors.shipFullName?.message} {...register("shipFullName")} />
                  </div>
                  <div>
                    <Label htmlFor="shipLine1">Address Line 1</Label>
                    <Input id="shipLine1" error={errors.shipLine1?.message} {...register("shipLine1")} />
                  </div>
                  <div>
                    <Label htmlFor="shipLine2">Address Line 2 (Optional)</Label>
                    <Input id="shipLine2" {...register("shipLine2")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipCity">City</Label>
                      <Input id="shipCity" error={errors.shipCity?.message} {...register("shipCity")} />
                    </div>
                    <div>
                      <Label htmlFor="shipState">State</Label>
                      <Input id="shipState" error={errors.shipState?.message} {...register("shipState")} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="shipCountry">Country</Label>
                      <Input id="shipCountry" error={errors.shipCountry?.message} {...register("shipCountry")} />
                    </div>
                    <div>
                      <Label htmlFor="shipPostalCode">Postal Code</Label>
                      <Input id="shipPostalCode" error={errors.shipPostalCode?.message} {...register("shipPostalCode")} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="shipPhone">Phone Number</Label>
                    <Input id="shipPhone" error={errors.shipPhone?.message} {...register("shipPhone")} />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2.5 text-sm text-overlay/70">
                  <input type="checkbox" className="h-4 w-4 accent-[#c9a24b]" {...register("billingSameAsShipping")} />
                  Billing address same as shipping
                </label>
              </div>

              {!values.billingSameAsShipping && (
                <div>
                  <h2 className="mb-5 font-serif text-xl text-fg">Billing Address</h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="billFullName">Full Name</Label>
                      <Input id="billFullName" error={errors.billFullName?.message} {...register("billFullName")} />
                    </div>
                    <div>
                      <Label htmlFor="billLine1">Address Line 1</Label>
                      <Input id="billLine1" error={errors.billLine1?.message} {...register("billLine1")} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billCity">City</Label>
                        <Input id="billCity" error={errors.billCity?.message} {...register("billCity")} />
                      </div>
                      <div>
                        <Label htmlFor="billState">State</Label>
                        <Input id="billState" error={errors.billState?.message} {...register("billState")} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="billCountry">Country</Label>
                        <Input id="billCountry" error={errors.billCountry?.message} {...register("billCountry")} />
                      </div>
                      <div>
                        <Label htmlFor="billPostalCode">Postal Code</Label>
                        <Input id="billPostalCode" error={errors.billPostalCode?.message} {...register("billPostalCode")} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="billPhone">Phone Number</Label>
                      <Input id="billPhone" error={errors.billPhone?.message} {...register("billPhone")} />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button type="button" variant="secondary" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button type="button" onClick={goNext} className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-fg">Payment Method</h2>
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-3 text-sm transition-colors",
                      values.paymentMethod === method.value
                        ? "border-gold bg-gold/5 text-fg"
                        : "border-overlay/15 text-overlay/60 hover:border-overlay/30"
                    )}
                  >
                    <input
                      type="radio"
                      value={method.value}
                      className="accent-[#c9a24b]"
                      {...register("paymentMethod")}
                    />
                    {method.label}
                  </label>
                ))}
              </div>

              {values.paymentMethod === "card" && (
                <div className="space-y-4 rounded-md border border-overlay/10 p-5">
                  <div>
                    <Label htmlFor="cardName">Name on Card</Label>
                    <Input id="cardName" error={errors.cardName?.message} {...register("cardName")} />
                  </div>
                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input id="cardNumber" placeholder="4242 4242 4242 4242" error={errors.cardNumber?.message} {...register("cardNumber")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry">Expiry (MM/YY)</Label>
                      <Input id="cardExpiry" placeholder="09/28" error={errors.cardExpiry?.message} {...register("cardExpiry")} />
                    </div>
                    <div>
                      <Label htmlFor="cardCvc">CVC</Label>
                      <Input id="cardCvc" placeholder="123" error={errors.cardCvc?.message} {...register("cardCvc")} />
                    </div>
                  </div>
                </div>
              )}
              {values.paymentMethod === "bank-transfer" && (
                <p className="rounded-md border border-overlay/10 p-4 text-xs text-overlay/50">
                  You&apos;ll receive our bank details by email. Orders are confirmed manually once
                  payment is received.
                </p>
              )}
              {values.paymentMethod === "cod" && (
                <p className="rounded-md border border-overlay/10 p-4 text-xs text-overlay/50">
                  Pay with cash upon delivery. Available for select locations within Nigeria.
                </p>
              )}
              {["paystack", "flutterwave", "paypal", "apple-pay", "google-pay"].includes(values.paymentMethod) && (
                <p className="rounded-md border border-overlay/10 p-4 text-xs text-overlay/50">
                  You&apos;ll be redirected to complete payment securely via {paymentMethods.find((p) => p.value === values.paymentMethod)?.label}.
                </p>
              )}

              <div className="rounded-md border border-overlay/10 p-5">
                <label className="flex items-center gap-2.5 text-sm text-overlay/70">
                  <input type="checkbox" className="h-4 w-4 accent-[#c9a24b]" {...register("giftWrap")} />
                  <Gift size={15} className="text-gold" /> Add gift wrapping
                </label>
                {values.giftWrap && (
                  <div className="mt-4">
                    <Label htmlFor="giftMessage">Gift Message (Optional)</Label>
                    <Textarea id="giftMessage" placeholder="Write a note..." {...register("giftMessage")} />
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="secondary" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button type="button" onClick={goNext} className="flex-1">
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-serif text-xl text-fg">Review &amp; Place Order</h2>

              <div className="rounded-md border border-overlay/10 p-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">Shipping To</h3>
                <p className="text-sm text-overlay/70">
                  {values.shipFullName}<br />
                  {values.shipLine1}{values.shipLine2 ? `, ${values.shipLine2}` : ""}<br />
                  {values.shipCity}, {values.shipState}, {values.shipCountry} {values.shipPostalCode}<br />
                  {values.shipPhone}
                </p>
              </div>

              <div className="rounded-md border border-overlay/10 p-5">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-gold">Payment Method</h3>
                <p className="text-sm text-overlay/70">
                  {paymentMethods.find((p) => p.value === values.paymentMethod)?.label}
                </p>
                {values.giftWrap && <p className="mt-1 text-xs text-gold">Gift wrapping included</p>}
              </div>

              <div className="rounded-md border border-overlay/10 p-5">
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-gold">Items</h3>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex items-center gap-3 text-sm">
                      <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-sm bg-overlay/5">
                        <Image src={item.image} alt={item.name} fill className="object-contain p-1" />
                      </div>
                      <span className="flex-1 text-overlay/70">{item.name} ({item.size}) × {item.quantity}</span>
                      <span className="text-fg">{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="button" variant="secondary" onClick={goBack} className="flex-1">
                  Back
                </Button>
                <Button type="submit" className="flex-1" disabled={placingOrder}>
                  <Lock size={14} /> {placingOrder ? "Placing Order…" : "Place Order"}
                </Button>
              </div>
            </div>
          )}
        </form>

        <div className="h-fit rounded-md border border-overlay/10 bg-overlay/[0.03] p-6">
          <h2 className="mb-6 font-serif text-xl text-fg">Order Summary</h2>
          <div className="max-h-64 space-y-4 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.variantId} className="flex items-center gap-3">
                <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-sm bg-overlay/5">
                  <Image src={item.image} alt={item.name} fill className="object-contain p-1.5" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[9px] font-bold text-ink">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-fg">{item.name}</p>
                  <p className="text-xs text-overlay/40">{item.size}</p>
                </div>
                <span className="text-sm text-fg">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-2 border-t border-overlay/10 pt-4 text-sm">
            <div className="flex justify-between text-overlay/60"><span>Subtotal</span><span>{formatCurrency(totals.subtotal)}</span></div>
            <div className="flex justify-between text-overlay/60"><span>Shipping</span><span>{totals.shipping === 0 ? "Free" : formatCurrency(totals.shipping)}</span></div>
            <div className="flex justify-between text-overlay/60"><span>Tax</span><span>{formatCurrency(totals.tax)}</span></div>
            {totals.discount > 0 && (
              <div className="flex justify-between text-gold"><span>Discount</span><span>-{formatCurrency(totals.discount)}</span></div>
            )}
          </div>
          <div className="mt-4 flex justify-between border-t border-overlay/10 pt-4 font-serif text-xl text-fg">
            <span>Total</span><Price amount={totals.total} />
          </div>
        </div>
      </div>
    </div>
  );
}

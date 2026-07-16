import { z } from "zod";

export const paymentMethods = [
  { value: "card", label: "Credit / Debit Card (Stripe)" },
  { value: "paystack", label: "Paystack (Card, Bank Transfer, USSD)" },
  { value: "flutterwave", label: "Flutterwave (Mobile Money)" },
  { value: "paypal", label: "PayPal" },
  { value: "apple-pay", label: "Apple Pay" },
  { value: "google-pay", label: "Google Pay" },
  { value: "bank-transfer", label: "Bank Transfer (Manual Confirmation)" },
  { value: "cod", label: "Cash on Delivery" },
] as const;

export type PaymentMethodValue = (typeof paymentMethods)[number]["value"];

export const checkoutSchema = z
  .object({
    guestEmail: z.string().email("Enter a valid email address."),
    shipFullName: z.string().min(1, "Full name is required."),
    shipLine1: z.string().min(1, "Address is required."),
    shipLine2: z.string().optional(),
    shipCity: z.string().min(1, "City is required."),
    shipState: z.string().min(1, "State is required."),
    shipCountry: z.string().min(1, "Country is required."),
    shipPostalCode: z.string().min(1, "Postal code is required."),
    shipPhone: z.string().min(7, "Enter a valid phone number."),
    billingSameAsShipping: z.boolean(),
    billFullName: z.string().optional(),
    billLine1: z.string().optional(),
    billLine2: z.string().optional(),
    billCity: z.string().optional(),
    billState: z.string().optional(),
    billCountry: z.string().optional(),
    billPostalCode: z.string().optional(),
    billPhone: z.string().optional(),
    paymentMethod: z.enum([
      "card",
      "paystack",
      "flutterwave",
      "paypal",
      "apple-pay",
      "google-pay",
      "bank-transfer",
      "cod",
    ]),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    cardName: z.string().optional(),
    giftWrap: z.boolean(),
    giftMessage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.billingSameAsShipping) {
      const requiredBillFields: (keyof typeof data)[] = [
        "billFullName",
        "billLine1",
        "billCity",
        "billState",
        "billCountry",
        "billPostalCode",
        "billPhone",
      ];
      requiredBillFields.forEach((field) => {
        if (!data[field] || String(data[field]).trim() === "") {
          ctx.addIssue({ code: "custom", message: "This field is required.", path: [field] });
        }
      });
    }
    if (data.paymentMethod === "card") {
      if (!data.cardName || data.cardName.trim() === "") {
        ctx.addIssue({ code: "custom", message: "Name on card is required.", path: ["cardName"] });
      }
      if (!data.cardNumber || !/^[\d\s]{15,19}$/.test(data.cardNumber)) {
        ctx.addIssue({ code: "custom", message: "Enter a valid card number.", path: ["cardNumber"] });
      }
      if (!data.cardExpiry || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(data.cardExpiry)) {
        ctx.addIssue({ code: "custom", message: "Use MM/YY format.", path: ["cardExpiry"] });
      }
      if (!data.cardCvc || !/^\d{3,4}$/.test(data.cardCvc)) {
        ctx.addIssue({ code: "custom", message: "Enter a valid CVC.", path: ["cardCvc"] });
      }
    }
  });

export type CheckoutValues = z.infer<typeof checkoutSchema>;

export const stepFields: Record<number, (keyof CheckoutValues)[]> = {
  0: ["guestEmail"],
  1: [
    "shipFullName",
    "shipLine1",
    "shipCity",
    "shipState",
    "shipCountry",
    "shipPostalCode",
    "shipPhone",
    "billingSameAsShipping",
    "billFullName",
    "billLine1",
    "billCity",
    "billState",
    "billCountry",
    "billPostalCode",
    "billPhone",
  ],
  2: ["paymentMethod", "cardName", "cardNumber", "cardExpiry", "cardCvc"],
  3: [],
};

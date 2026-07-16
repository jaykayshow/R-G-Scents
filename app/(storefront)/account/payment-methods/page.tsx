"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CreditCard, Plus, Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useToastStore } from "@/lib/store/toast-store";

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expiry: string;
  isDefault: boolean;
}

const initialCards: SavedCard[] = [
  { id: "c-1", brand: "Visa", last4: "4242", expiry: "09/28", isDefault: true },
  { id: "c-2", brand: "Mastercard", last4: "8145", expiry: "03/27", isDefault: false },
];

const schema = z.object({
  cardNumber: z
    .string()
    .min(15, "Enter a valid card number.")
    .max(19)
    .regex(/^[\d\s]+$/, "Card number must contain only digits."),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY format."),
  cvc: z.string().regex(/^\d{3,4}$/, "Enter a valid CVC."),
  nameOnCard: z.string().min(1, "Name on card is required."),
});
type FormValues = z.infer<typeof schema>;

function detectBrand(cardNumber: string) {
  const digits = cardNumber.replace(/\s/g, "");
  if (digits.startsWith("4")) return "Visa";
  if (digits.startsWith("5")) return "Mastercard";
  if (digits.startsWith("3")) return "Amex";
  return "Card";
}

export default function PaymentMethodsPage() {
  const [cards, setCards] = useState<SavedCard[]>(initialCards);
  const [modalOpen, setModalOpen] = useState(false);
  const showToast = useToastStore((s) => s.show);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    const digits = values.cardNumber.replace(/\s/g, "");
    const newCard: SavedCard = {
      id: `c-${Date.now()}`,
      brand: detectBrand(digits),
      last4: digits.slice(-4),
      expiry: values.expiry,
      isDefault: cards.length === 0,
    };
    setCards((prev) => [...prev, newCard]);
    showToast("Card saved securely via tokenized vault.");
    reset();
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-xl text-fg">Payment Methods</h2>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Add Card
        </Button>
      </div>
      <p className="mb-6 text-xs text-overlay/40">
        Cards are tokenized via our payment gateway partners — R&amp;G Scents never stores raw card
        data.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-gold" />
                <span className="text-sm font-semibold text-fg">{card.brand}</span>
              </div>
              {card.isDefault && (
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold">
                  <Star size={11} className="fill-gold" /> Default
                </span>
              )}
            </div>
            <p className="mt-4 font-serif text-lg tracking-widest text-fg">•••• •••• •••• {card.last4}</p>
            <p className="mt-1 text-xs text-overlay/40">Expires {card.expiry}</p>
            <div className="mt-4 flex gap-3">
              {!card.isDefault && (
                <button
                  onClick={() =>
                    setCards((prev) => prev.map((c) => ({ ...c, isDefault: c.id === card.id })))
                  }
                  className="text-xs text-gold hover:underline"
                >
                  Set as Default
                </button>
              )}
              <button
                onClick={() => setCards((prev) => prev.filter((c) => c.id !== card.id))}
                className="flex items-center gap-1 text-xs text-overlay/40 hover:text-red-300"
              >
                <Trash2 size={12} /> Remove
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-10 w-full max-w-lg overflow-y-auto rounded-md border border-overlay/10 bg-surface p-8">
        <h3 className="mb-6 font-serif text-xl text-fg">Add Payment Card</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="nameOnCard">Name on Card</Label>
            <Input id="nameOnCard" error={errors.nameOnCard?.message} {...register("nameOnCard")} />
          </div>
          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <Input id="cardNumber" placeholder="4242 4242 4242 4242" error={errors.cardNumber?.message} {...register("cardNumber")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expiry">Expiry (MM/YY)</Label>
              <Input id="expiry" placeholder="09/28" error={errors.expiry?.message} {...register("expiry")} />
            </div>
            <div>
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" error={errors.cvc?.message} {...register("cvc")} />
            </div>
          </div>
          <Button type="submit" className="w-full">Save Card</Button>
        </form>
      </Modal>
    </div>
  );
}

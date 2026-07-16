"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, LifeBuoy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { SupportTicket } from "@/types";
import { useSupportStore } from "@/lib/store/support-store";
import { useToastStore } from "@/lib/store/toast-store";
import { formatDate } from "@/lib/utils";

const schema = z.object({
  category: z.string().min(1, "Please select a category."),
  subject: z.string().min(1, "Subject is required."),
  message: z.string().min(10, "Please provide more detail (at least 10 characters)."),
});
type FormValues = z.infer<typeof schema>;

const statusVariant = (status: SupportTicket["status"]) =>
  status === "Resolved" ? "gold" : status === "Awaiting Reply" ? "outline" : "danger";

export default function SupportPage() {
  const tickets = useSupportStore((s) => s.tickets);
  const addTicket = useSupportStore((s) => s.addTicket);
  const [modalOpen, setModalOpen] = useState(false);
  const showToast = useToastStore((s) => s.show);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    addTicket({
      subject: values.subject,
      category: values.category,
      messages: [{ author: "customer", content: values.message, date: new Date().toISOString() }],
    });
    showToast("Support ticket submitted — we'll respond within 24 hours.");
    reset();
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-xl text-brand-white">Support Tickets</h2>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> New Ticket
        </Button>
      </div>

      {tickets.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-12 text-center">
          <LifeBuoy size={28} className="text-white/30" />
          <p className="text-sm text-white/50">No support tickets yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/account/support/${ticket.id}`}>
              <Card className="flex items-center justify-between p-5 transition-colors hover:border-gold/40">
                <div>
                  <p className="text-sm font-medium text-brand-white">{ticket.subject}</p>
                  <p className="text-xs text-white/40">{ticket.category} · {formatDate(ticket.createdAt)}</p>
                </div>
                <Badge variant={statusVariant(ticket.status)}>{ticket.status}</Badge>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-10 w-full max-w-lg overflow-y-auto rounded-md border border-white/10 bg-charcoal p-8">
        <h3 className="mb-6 font-serif text-xl text-brand-white">New Support Ticket</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Select id="category" defaultValue="" error={errors.category?.message} {...register("category")}>
              <option value="" disabled>Select a category</option>
              <option value="Order">Order Issue</option>
              <option value="Product">Product Question</option>
              <option value="Shipping">Shipping & Delivery</option>
              <option value="Billing">Billing & Payments</option>
              <option value="Other">Other</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" error={errors.subject?.message} {...register("subject")} />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea id="message" error={errors.message?.message} {...register("message")} />
          </div>
          <Button type="submit" className="w-full">Submit Ticket</Button>
        </form>
      </Modal>
    </div>
  );
}

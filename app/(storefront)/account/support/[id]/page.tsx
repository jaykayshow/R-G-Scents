"use client";

import { use, useState } from "react";
import { notFound } from "next/navigation";
import { LifeBuoy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useSupportStore } from "@/lib/store/support-store";
import { formatDate } from "@/lib/utils";

const statusVariant = (status: string) =>
  status === "Resolved" ? "gold" : status === "Awaiting Reply" ? "outline" : "danger";

export default function SupportTicketDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const tickets = useSupportStore((s) => s.tickets);
  const reply = useSupportStore((s) => s.reply);
  const ticket = tickets.find((t) => t.id === id);
  const [message, setMessage] = useState("");

  if (!ticket) notFound();

  function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    reply(ticket!.id, message.trim());
    setMessage("");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LifeBuoy size={18} className="text-gold" />
          <h2 className="font-serif text-xl text-brand-white">{ticket.subject}</h2>
        </div>
        <Badge variant={statusVariant(ticket.status) as never}>{ticket.status}</Badge>
      </div>
      <p className="mb-6 text-xs text-white/40">
        {ticket.category} · Opened {formatDate(ticket.createdAt)}
      </p>

      <div className="space-y-4">
        {ticket.messages.map((msg, i) => (
          <Card
            key={i}
            className={`p-5 ${msg.author === "support" ? "border-gold/30 bg-gold/5" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">
                {msg.author === "support" ? "R&G Scents Support" : "You"}
              </span>
              <span className="text-xs text-white/30">{formatDate(msg.date)}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/70">{msg.content}</p>
          </Card>
        ))}
      </div>

      {ticket.status !== "Resolved" && (
        <form onSubmit={handleReply} className="mt-8 space-y-3">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your reply..."
          />
          <Button type="submit">Send Reply</Button>
        </form>
      )}
    </div>
  );
}

import { AuditLogEntry } from "@/types";

export const auditLogs: AuditLogEntry[] = [
  {
    id: "log-1",
    actor: "Rita Green",
    action: "Updated stock",
    target: "Noir — 50ml (RG-NOI-50)",
    category: "Inventory",
    date: "2026-07-14T09:12:00Z",
  },
  {
    id: "log-2",
    actor: "Tobi Adeyemi",
    action: "Changed order status to Shipped",
    target: "RG-100519",
    category: "Order",
    date: "2026-07-12T14:30:00Z",
  },
  {
    id: "log-3",
    actor: "Kunle Bassey",
    action: "Published blog post",
    target: "Inside The Billionaire Collection: Our Sourcing Philosophy",
    category: "Blog",
    date: "2026-07-10T11:05:00Z",
  },
  {
    id: "log-4",
    actor: "Ngozi Bello",
    action: "Approved review",
    target: "Review r-1 on Legacy",
    category: "Review",
    date: "2026-07-09T16:45:00Z",
  },
  {
    id: "log-5",
    actor: "Rita Green",
    action: "Created coupon",
    target: "WELCOME20",
    category: "Coupon",
    date: "2026-06-28T08:20:00Z",
  },
  {
    id: "log-6",
    actor: "Rita Green",
    action: "Deactivated admin account",
    target: "seasonal-intern@rgscents.com",
    category: "User",
    date: "2026-06-20T13:10:00Z",
  },
];

export function nextLogId() {
  return `log-${Date.now()}`;
}

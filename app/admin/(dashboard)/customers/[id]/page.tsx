"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, Mail, Phone } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { useCustomersStore } from "@/lib/store/customers-store";
import { useOrdersStore } from "@/lib/store/orders-store";
import { useToastStore } from "@/lib/store/toast-store";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

export default function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customer = useCustomersStore((s) => s.customers.find((c) => c.id === id));
  const fetchCustomer = useCustomersStore((s) => s.fetchCustomer);
  const toggleStatus = useCustomersStore((s) => s.toggleStatus);
  const setNotes = useCustomersStore((s) => s.setNotes);
  const orders = useOrdersStore((s) => s.orders);
  const fetchAllOrders = useOrdersStore((s) => s.fetchAllForAdmin);
  const showToast = useToastStore((s) => s.show);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    fetchAllOrders();
    if (customer) {
      setChecked(true);
      return;
    }
    fetchCustomer(id).finally(() => setChecked(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [notesDraft, setNotesDraft] = useState(customer?.notes ?? "");

  useEffect(() => {
    setNotesDraft(customer?.notes ?? "");
  }, [customer?.notes]);

  if (!checked) return <div className="min-h-[40vh]" />;

  if (!customer) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <p className="text-overlay/50">Customer not found.</p>
        <Link href="/admin/customers" className="text-xs text-gold hover:underline">
          &larr; Back to Customers
        </Link>
      </div>
    );
  }

  const customerOrders = orders.filter((o) => o.shippingAddress.fullName === customer.name);

  async function handleToggleStatus() {
    try {
      await toggleStatus(customer!.id);
      showToast(`${customer!.name} is now ${customer!.status === "Active" ? "Suspended" : "Active"}.`);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleSaveNotes() {
    try {
      await setNotes(customer!.id, notesDraft);
      showToast("Customer notes saved.");
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  return (
    <div>
      <Link href="/admin/customers" className="mb-4 inline-flex items-center gap-1.5 text-xs text-overlay/40 hover:text-gold">
        <ArrowLeft size={13} /> Back to Customers
      </Link>
      <AdminPageHeader
        title={customer.name}
        description={`Customer since ${formatDate(customer.joinedAt)}`}
        actions={
          <Button
            size="sm"
            variant="secondary"
            onClick={handleToggleStatus}
            className={customer.status === "Active" ? "border-red-400/40 text-red-300 hover:bg-red-400 hover:text-ink" : ""}
          >
            {customer.status === "Active" ? <Ban size={14} /> : <CheckCircle2 size={14} />}
            {customer.status === "Active" ? "Suspend Account" : "Reactivate Account"}
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Order History</h2>
            {customerOrders.length === 0 ? (
              <p className="text-sm text-overlay/40">No orders found for this customer.</p>
            ) : (
              <div className="space-y-3">
                {customerOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b border-overlay/5 pb-3 last:border-0 last:pb-0">
                    <div>
                      <Link href={`/admin/orders/${order.orderNumber}`} className="text-sm text-fg hover:text-gold">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-overlay/40">{formatDate(order.date)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{order.status}</Badge>
                      <span className="text-sm text-overlay/80">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Internal Notes</h2>
            <Textarea
              value={notesDraft}
              onChange={(e) => setNotesDraft(e.target.value)}
              placeholder="Add internal notes about this customer (visible only to staff)..."
            />
            <Button size="sm" className="mt-3" onClick={handleSaveNotes}>
              Save Notes
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Contact Info</h2>
            <div className="space-y-3 text-sm text-overlay/70">
              <p className="flex items-center gap-2"><Mail size={14} className="text-gold" /> {customer.email}</p>
              {customer.phone && <p className="flex items-center gap-2"><Phone size={14} className="text-gold" /> {customer.phone}</p>}
            </div>
          </div>
          <div className="rounded-md border border-overlay/10 bg-overlay/[0.02] p-5">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-overlay/50">Lifetime Value</h2>
            <p className="font-serif text-3xl text-fg">{formatCurrency(customer.totalSpent)}</p>
            <p className="mt-1 text-xs text-overlay/40">{customer.ordersCount} order(s) placed</p>
          </div>
        </div>
      </div>
    </div>
  );
}

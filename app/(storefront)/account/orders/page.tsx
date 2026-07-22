"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/input";
import { useOrdersStore } from "@/lib/store/orders-store";
import { OrderStatus } from "@/types";
import { formatDate } from "@/lib/utils";
import { Price } from "@/components/ui/price";

const statusVariant = (status: OrderStatus) =>
  status === "Delivered" ? "gold" : status === "Cancelled" || status === "Refunded" ? "danger" : "outline";

export default function OrdersPage() {
  const orders = useOrdersStore((s) => s.orders);
  const loading = useOrdersStore((s) => s.loading);
  const fetchMine = useOrdersStore((s) => s.fetchMine);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  useEffect(() => {
    fetchMine();
  }, [fetchMine]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-xl text-fg">Order History</h2>
        <Select value={filter} onChange={(e) => setFilter(e.target.value as never)} className="w-48">
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Refunded">Refunded</option>
        </Select>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card className="p-6 text-sm text-overlay/50">
            {loading ? "Loading orders…" : "No orders match this filter."}
          </Card>
        ) : (
          filtered.map((order) => (
            <Card key={order.id} className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-fg">{order.orderNumber}</p>
                  <p className="text-xs text-overlay/40">Placed {formatDate(order.date)}</p>
                </div>
                <Badge variant={statusVariant(order.status)}>{order.status}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-overlay/10 pt-4 text-sm">
                <span className="text-overlay/60">{order.items.length} item(s)</span>
                <Price amount={order.total} className="font-serif text-fg" />
                <Link
                  href={`/account/orders/${order.orderNumber}`}
                  className="ml-auto text-xs uppercase tracking-widest text-gold hover:underline"
                >
                  View Details &amp; Reorder
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

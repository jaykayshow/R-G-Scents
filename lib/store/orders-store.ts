import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order, OrderStatus } from "@/types";
import { orders as seedOrders } from "@/lib/mock-data/orders";

const STATUS_NOTES: Record<OrderStatus, string> = {
  Pending: "Order placed",
  Processing: "Payment confirmed, preparing order",
  Shipped: "Handed to courier",
  Delivered: "Delivered to recipient",
  Cancelled: "Order cancelled",
  Refunded: "Order refunded",
};

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getByNumber: (orderNumber: string) => Order | undefined;
  updateStatus: (orderNumber: string, status: OrderStatus, note?: string) => void;
  setTrackingNumber: (orderNumber: string, trackingNumber: string) => void;
}

let orderSequence = 1004;

export function nextOrderNumber() {
  orderSequence += 1;
  return `RG-${100000 + orderSequence}`;
}

export const useOrdersStore = create<OrdersState>()(
  persist(
    (set, get) => ({
      orders: seedOrders,
      addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
      getByNumber: (orderNumber) => get().orders.find((o) => o.orderNumber === orderNumber),
      updateStatus: (orderNumber, status, note) =>
        set((state) => ({
          orders: state.orders.map((o) =>
            o.orderNumber === orderNumber
              ? {
                  ...o,
                  status,
                  trackingEvents: [
                    ...o.trackingEvents,
                    { status, date: new Date().toISOString(), note: note ?? STATUS_NOTES[status] },
                  ],
                }
              : o
          ),
        })),
      setTrackingNumber: (orderNumber, trackingNumber) =>
        set((state) => ({
          orders: state.orders.map((o) => (o.orderNumber === orderNumber ? { ...o, trackingNumber } : o)),
        })),
    }),
    { name: "rg-scents-orders" }
  )
);

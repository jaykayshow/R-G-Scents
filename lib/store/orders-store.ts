import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Order } from "@/types";
import { orders as seedOrders } from "@/lib/mock-data/orders";

interface OrdersState {
  orders: Order[];
  addOrder: (order: Order) => void;
  getByNumber: (orderNumber: string) => Order | undefined;
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
    }),
    { name: "rg-scents-orders" }
  )
);

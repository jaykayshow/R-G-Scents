import { create } from "zustand";
import { Order, OrderStatus } from "@/types";
import { apiClient, CreateOrderInput } from "@/lib/api-client";

interface OrdersState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  fetchMine: () => Promise<void>;
  fetchAllForAdmin: () => Promise<void>;
  createOrder: (input: CreateOrderInput) => Promise<Order>;
  fetchByNumber: (orderNumber: string) => Promise<Order | undefined>;
  getByNumber: (orderNumber: string) => Order | undefined;
  updateStatus: (orderNumber: string, status: OrderStatus) => Promise<void>;
  setTrackingNumber: (orderNumber: string, trackingNumber: string) => Promise<void>;
}

function upsert(orders: Order[], order: Order): Order[] {
  const exists = orders.some((o) => o.orderNumber === order.orderNumber);
  return exists ? orders.map((o) => (o.orderNumber === order.orderNumber ? order : o)) : [order, ...orders];
}

export const useOrdersStore = create<OrdersState>()((set, get) => ({
  orders: [],
  loading: false,
  error: null,

  fetchMine: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await apiClient.orders.listMine();
      set({ orders, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load orders.", loading: false });
    }
  },

  fetchAllForAdmin: async () => {
    set({ loading: true, error: null });
    try {
      const orders = await apiClient.adminOrders.list();
      set({ orders, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load orders.", loading: false });
    }
  },

  createOrder: async (input) => {
    const order = await apiClient.orders.create(input);
    set((state) => ({ orders: upsert(state.orders, order) }));
    return order;
  },

  fetchByNumber: async (orderNumber) => {
    try {
      const order = await apiClient.orders.byNumber(orderNumber);
      set((state) => ({ orders: upsert(state.orders, order) }));
      return order;
    } catch {
      return undefined;
    }
  },

  getByNumber: (orderNumber) => get().orders.find((o) => o.orderNumber === orderNumber),

  updateStatus: async (orderNumber, status) => {
    const updated = await apiClient.adminOrders.updateStatus(orderNumber, status);
    set((state) => ({ orders: upsert(state.orders, updated) }));
  },

  setTrackingNumber: async (orderNumber, trackingNumber) => {
    const updated = await apiClient.adminOrders.updateTracking(orderNumber, trackingNumber);
    set((state) => ({ orders: upsert(state.orders, updated) }));
  },
}));

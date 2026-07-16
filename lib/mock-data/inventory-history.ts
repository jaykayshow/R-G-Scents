import { InventoryHistoryEntry } from "@/types";

export const inventoryHistory: InventoryHistoryEntry[] = [
  {
    id: "ih-1",
    productId: "p-noir",
    productName: "Noir",
    variantId: "v-noir-50",
    variantSize: "50ml",
    sku: "RG-NOI-50",
    change: -12,
    previousStock: 33,
    newStock: 21,
    reason: "Sale fulfillment",
    actor: "System",
    date: "2026-07-10T10:00:00Z",
  },
  {
    id: "ih-2",
    productId: "p-noir",
    productName: "Noir",
    variantId: "v-noir-100",
    variantSize: "100ml",
    sku: "RG-NOI-100",
    change: 12,
    previousStock: 0,
    newStock: 12,
    reason: "Restock from supplier",
    actor: "Rita Green",
    date: "2026-07-14T09:12:00Z",
  },
  {
    id: "ih-3",
    productId: "p-royale",
    productName: "Royale",
    variantId: "v-royale-100",
    variantSize: "100ml",
    sku: "RG-ROY-100",
    change: -8,
    previousStock: 27,
    newStock: 19,
    reason: "Sale fulfillment",
    actor: "System",
    date: "2026-07-11T15:30:00Z",
  },
];

export function nextInventoryLogId() {
  return `ih-${Date.now()}`;
}

import { Order } from "@/types";
import { formatCurrency, formatDate } from "@/lib/utils";

export function downloadInvoice(order: Order) {
  const lines = [
    `R&G SCENTS — INVOICE`,
    `Order: ${order.orderNumber}`,
    `Date: ${formatDate(order.date)}`,
    ``,
    ...order.items.map(
      (i) => `${i.productName} (${i.variantSize}) x${i.quantity} — ${formatCurrency(i.unitPrice * i.quantity)}`
    ),
    ``,
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Shipping: ${formatCurrency(order.shipping)}`,
    `Tax: ${formatCurrency(order.tax)}`,
    `Discount: -${formatCurrency(order.discount)}`,
    `Total: ${formatCurrency(order.total)}`,
    ``,
    `Shipping Address:`,
    `${order.shippingAddress.fullName}`,
    `${order.shippingAddress.line1}${order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}`,
    `${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.country}`,
    `${order.shippingAddress.postalCode}`,
    ``,
    `Payment Method: ${order.paymentMethod}`,
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${order.orderNumber}-invoice.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

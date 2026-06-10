import { OrderDraft } from "../types/order";
import { businessInfo } from "../data/business";
import { formatCurrency } from "./currency";

export const buildWhatsAppOrderMessage = (order: OrderDraft) => {
  const products = order.items
    .map((cartItem) => `- ${cartItem.quantity}x ${cartItem.item.name} (${formatCurrency(cartItem.item.price)})`)
    .join("\n");

  const fulfillmentLabels = {
    delivery: "Entrega",
    pickup: "Retirada",
    table: "Mesa"
  };

  return [
    "Novo pedido Pit's Dog",
    "",
    products,
    "",
    `Tipo: ${fulfillmentLabels[order.checkout.fulfillment]}`,
    `Cliente: ${order.checkout.customerName || "Nao informado"}`,
    `Telefone: ${order.checkout.phone || "Nao informado"}`,
    order.checkout.fulfillment === "delivery" ? `Endereco: ${order.checkout.address || "Nao informado"}` : "",
    order.checkout.fulfillment === "table" ? `Mesa: ${order.checkout.tableNumber || "Nao informada"}` : "",
    `Pagamento: ${order.checkout.paymentMethod.toUpperCase()}`,
    order.checkout.notes ? `Observacoes: ${order.checkout.notes}` : "",
    "",
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Entrega: ${formatCurrency(order.deliveryFee)}`,
    `Total: ${formatCurrency(order.total)}`
  ]
    .filter(Boolean)
    .join("\n");
};

export const getWhatsAppUrl = (message = "Boa noite") =>
  `https://wa.me/${businessInfo.phone.whatsapp}?text=${encodeURIComponent(message)}`;

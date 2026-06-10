import { CreatedOrder, OrderDraft } from "../types/order";

const botBaseUrl = import.meta.env.VITE_WHATSAPP_BOT_URL?.replace(/\/$/, "") ?? "";
const adminPin = import.meta.env.VITE_WHATSAPP_ADMIN_PIN ?? "";

const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

const paymentLabels: Record<OrderDraft["checkout"]["paymentMethod"], string> = {
  card: "Cartão",
  cash: "Dinheiro",
  pix: "Pix"
};

const parseOrderItem = (cartItem: OrderDraft["items"][number]) => ({
  additions: (cartItem.extras ?? []).map((extra) => ({
    name: extra.item.name,
    price: extra.item.price,
    quantity: extra.quantity
  })),
  name: cartItem.item.name,
  observation: cartItem.notes?.trim() || "",
  price: cartItem.item.price,
  quantity: Math.max(1, cartItem.quantity)
});

export const notifyWhatsAppOrderCreated = async (
  order: OrderDraft,
  createdOrder: CreatedOrder
) => {
  if (!botBaseUrl) {
    console.warn("Bot WhatsApp nao configurado: informe VITE_WHATSAPP_BOT_URL no deploy do site.");
    return;
  }

  if (order.checkout.fulfillment === "table") return;

  const customerPhone = cleanPhone(order.checkout.phone);

  if (!customerPhone) {
    console.warn("Bot WhatsApp nao notificado: pedido sem telefone do cliente.", createdOrder);
    return;
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(`${botBaseUrl}/api/notify-order`, {
      body: JSON.stringify({
        event: "pedido_criado",
        order: {
          code: createdOrder.numeroPedido ?? createdOrder.id,
          customerName: order.checkout.customerName,
          customerPhone,
          delivery: order.checkout.fulfillment,
          items: order.items.map(parseOrderItem),
          payment: paymentLabels[order.checkout.paymentMethod],
          paymentMethod: order.checkout.paymentMethod,
          total: order.total
        }
      }),
      headers: {
        "Content-Type": "application/json",
        ...(adminPin ? { "x-admin-pin": adminPin } : {})
      },
      method: "POST",
      signal: controller.signal
    });

    const payload = await response.json().catch(() => null) as { error?: string; ok?: boolean } | null;

    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error ?? "Bot WhatsApp recusou a notificação do pedido.");
    }
  } finally {
    window.clearTimeout(timeout);
  }
};

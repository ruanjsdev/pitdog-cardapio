import { CreatedOrder, OrderDraft } from "../types/order";
import { apiRequest, hasApiUrl } from "./apiClient";
import { notifyWhatsAppOrderCreated } from "./whatsappBotService";

const mapFulfillment = (fulfillment: OrderDraft["checkout"]["fulfillment"]) => {
  if (fulfillment === "pickup") return "RETIRADA";
  if (fulfillment === "table") return "MESA";
  return "ENTREGA";
};

const mapPaymentMethod = (paymentMethod: OrderDraft["checkout"]["paymentMethod"]) => {
  if (paymentMethod === "cash") return "DINHEIRO";
  return "PIX";
};

const mapCardPaymentMethod = (cardType: OrderDraft["checkout"]["cardType"]) => {
  if (cardType === "debit") return "CARTAO_DEBITO";
  return "CARTAO_CREDITO";
};

const toApiId = (id: string) => {
  const numericId = Number(id);
  return Number.isFinite(numericId) ? numericId : id;
};

const toOptionalInteger = (value: string) => {
  const numericValue = Number.parseInt(value.replace(/\D/g, ""), 10);
  return Number.isFinite(numericValue) ? numericValue : undefined;
};

const cleanPhone = (phone: string) => phone.replace(/\D/g, "");

const buildCreateOrderPayload = (order: OrderDraft) => ({
  tipoPedido: mapFulfillment(order.checkout.fulfillment),
  numeroMesa:
    order.checkout.fulfillment === "table"
      ? toOptionalInteger(order.checkout.tableNumber)
      : undefined,
  nomeCliente: order.checkout.customerName,
  telefoneCliente:
    order.checkout.fulfillment === "table"
      ? undefined
      : cleanPhone(order.checkout.phone),
  bairroEntrega:
    order.checkout.fulfillment === "delivery"
      ? order.checkout.deliveryAddress.neighborhood
      : undefined,
  ruaEntrega:
    order.checkout.fulfillment === "delivery"
      ? order.checkout.deliveryAddress.street
      : undefined,
  numeroCasa:
    order.checkout.fulfillment === "delivery"
      ? toOptionalInteger(order.checkout.deliveryAddress.number)
      : undefined,
  complemento:
    order.checkout.fulfillment === "delivery"
      ? order.checkout.deliveryAddress.complement
      : undefined,
  formaPagamento:
    order.checkout.fulfillment === "table"
      ? undefined
      : order.checkout.paymentMethod === "card"
      ? mapCardPaymentMethod(order.checkout.cardType)
      : mapPaymentMethod(order.checkout.paymentMethod),
  origemPedido: "SITE",
  observacao: "",
  itens: order.items.map((cartItem) => {
    const isCombo = cartItem.item.type === "COMBO";

    return {
      tipoItem: isCombo ? "COMBO" : "PRODUTO",
      ...(isCombo
        ? { comboId: toApiId(cartItem.item.id) }
        : { produtoId: toApiId(cartItem.item.id) }),
      quantidade: Math.max(1, cartItem.quantity),
      observacao: cartItem.notes?.trim() || "",
      adicionais:
        !isCombo && cartItem.item.allowsAdditionals !== false && cartItem.extras && cartItem.extras.length > 0
          ? cartItem.extras.map((extra) => ({
              adicionalId: toApiId(extra.item.id),
              quantidade: Math.max(1, extra.quantity)
            }))
          : []
    };
  })
});

export const createOrderDraft = async (order: OrderDraft): Promise<CreatedOrder> => {
  if (hasApiUrl) {
    const createdOrder = await apiRequest<CreatedOrder>("/pedidos", {
      method: "POST",
      body: JSON.stringify(buildCreateOrderPayload(order))
    });

    notifyWhatsAppOrderCreated(order, createdOrder).catch((error) => {
      console.warn("Nao foi possivel notificar o bot WhatsApp sobre o pedido criado.", error);
    });

    return createdOrder;
  }

  await new Promise((resolve) => window.setTimeout(resolve, 450));

  return {
    id: `PD-${Date.now()}`,
    status: "pendente",
    total: order.total,
    criadoEm: new Date().toISOString(),
    numeroPedido: Date.now()
  };
};

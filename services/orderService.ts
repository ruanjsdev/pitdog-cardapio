import { CreatedOrder, OrderDraft } from "../types/order";
import { apiRequest, hasApiUrl } from "./apiClient";

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

const buildCreateOrderPayload = (order: OrderDraft) => ({
  tipoPedido: mapFulfillment(order.checkout.fulfillment),
  numeroMesa:
    order.checkout.fulfillment === "table"
      ? toOptionalInteger(order.checkout.tableNumber)
      : undefined,
  nomeCliente: order.checkout.customerName,
  telefoneCliente: order.checkout.phone,
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
    order.checkout.paymentMethod === "card"
      ? mapCardPaymentMethod(order.checkout.cardType)
      : mapPaymentMethod(order.checkout.paymentMethod),
  taxaEntrega: order.deliveryFee,
  descontoManualPercentual: 0,
  descontoManualValor: 0,
  itens: order.items.map((cartItem) => ({
    produtoId: toApiId(cartItem.item.id),
    tipoItem: "PRODUTO",
    quantidade: cartItem.quantity,
    observacao: cartItem.notes ?? order.checkout.notes,
    adicionais:
      cartItem.extras && cartItem.extras.length > 0
        ? cartItem.extras.map((extra) => ({
            adicionalId: toApiId(extra.item.id),
            quantidade: extra.quantity
          }))
        : (cartItem.addons ?? []).map((adicionalId) => ({
            adicionalId: toApiId(adicionalId),
            quantidade: 1
          }))
  }))
});

export const createOrderDraft = async (order: OrderDraft): Promise<CreatedOrder> => {
  if (hasApiUrl) {
    return apiRequest<CreatedOrder>("/pedidos", {
      method: "POST",
      body: JSON.stringify(buildCreateOrderPayload(order))
    });
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

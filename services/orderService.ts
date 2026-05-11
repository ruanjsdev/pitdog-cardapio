import { CreatedOrder, OrderDraft } from "../types/order";
import { apiRequest, hasApiUrl } from "./apiClient";

const mapFulfillment = (fulfillment: OrderDraft["checkout"]["fulfillment"]) => {
  if (fulfillment === "pickup") return "retirada";
  if (fulfillment === "table") return "mesa";
  return "entrega";
};

const mapPaymentMethod = (paymentMethod: OrderDraft["checkout"]["paymentMethod"]) => {
  if (paymentMethod === "cash") return "dinheiro";
  if (paymentMethod === "card") return "cartao";
  return "pix";
};

const buildCreateOrderPayload = (order: OrderDraft) => ({
  cliente: {
    nome: order.checkout.customerName,
    telefone: order.checkout.phone
  },
  tipoEntrega: mapFulfillment(order.checkout.fulfillment),
  endereco:
    order.checkout.fulfillment === "delivery"
      ? {
          rua: order.checkout.deliveryAddress.street,
          numero: order.checkout.deliveryAddress.number,
          bairro: order.checkout.deliveryAddress.neighborhood,
          complemento: order.checkout.deliveryAddress.complement,
          referencia: order.checkout.deliveryAddress.reference
        }
      : null,
  mesa: order.checkout.fulfillment === "table" ? order.checkout.tableNumber : null,
  pagamento: {
    forma: mapPaymentMethod(order.checkout.paymentMethod),
    tipoCartao: order.checkout.paymentMethod === "card" ? order.checkout.cardType : null,
    trocoPara:
      order.checkout.paymentMethod === "cash" && order.checkout.needsChange
        ? order.checkout.changeFor
        : null
  },
  itens: order.items.map((cartItem) => ({
    produtoId: cartItem.item.id,
    quantidade: cartItem.quantity,
    observacao: cartItem.notes ?? "",
    adicionais: cartItem.addons ?? []
  })),
  observacaoGeral: order.checkout.notes
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

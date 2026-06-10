import { OrderDraft } from "../types/order";

// Futuro ponto de integracao com provedor PIX: Mercado Pago, Asaas, Gerencianet etc.
export const createPixPaymentIntent = async (order: OrderDraft) => {
  await new Promise((resolve) => window.setTimeout(resolve, 300));

  return {
    provider: "pix-mock",
    amount: order.total,
    qrCode: "PIX_EM_DESENVOLVIMENTO",
    expiresInMinutes: 15
  };
};

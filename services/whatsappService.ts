import { OrderDraft } from "../types/order";
import { buildWhatsAppOrderMessage, getWhatsAppUrl } from "../utils/whatsapp";

// Este servico concentra a futura integracao com IA, chatbot e acompanhamento de pedido.
export const openWhatsAppCheckout = (order: OrderDraft) => {
  const message = buildWhatsAppOrderMessage(order);
  window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer");
};

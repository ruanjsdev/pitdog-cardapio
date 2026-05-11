import { MessageCircle } from "lucide-react";
import { OrderDraft } from "../types/order";
import { buildWhatsAppOrderMessage, getWhatsAppUrl } from "../utils/whatsapp";

interface WhatsAppButtonProps {
  orderDraft: OrderDraft;
}

export const WhatsAppButton = () => {
  const href = getWhatsAppUrl("boa noite");

  return (
    <a
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Abrir WhatsApp"
    >
      <MessageCircle size={26} />
    </a>
  );
};

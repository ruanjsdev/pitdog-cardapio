import { MenuItem } from "./menu";

export interface CartItem {
  item: MenuItem;
  quantity: number;
  notes?: string;
  addons?: {
    adicionalId: string;
    quantidade: number;
  }[];
}

export interface DeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference: string;
}

export interface CheckoutForm {
  customerName: string;
  phone: string;
  address: string;
  deliveryAddress: DeliveryAddress;
  tableNumber: string;
  notes: string;

  fulfillment: "delivery" | "pickup" | "table";

  paymentMethod: "pix" | "card" | "cash";

  cardType: "credit" | "debit";

  needsChange: boolean;
  changeFor: string;
}
export interface OrderDraft {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  checkout: CheckoutForm;
}

export interface CreatedOrder {
  id: string;
  numeroPedido?: number;
  status: "pendente" | "aceito" | "em_preparo" | "saiu_para_entrega" | "pronto_para_retirada" | "finalizado" | "cancelado" | string;
  total: number;
  criadoEm?: string;
}

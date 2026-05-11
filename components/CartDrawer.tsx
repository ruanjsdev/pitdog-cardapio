import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { MenuItem } from "../types/menu";
import { CartItem } from "../types/order";
import { formatCurrency } from "../utils/currency";

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  summary: {
    count: number;
    subtotal: number;
    deliveryFee: number;
    total: number;
  };
  onClose: () => void;
  onAddItem: (item: MenuItem) => void;
  onDecreaseItem: (itemId: string) => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onAddMore?: () => void;
  checkoutDisabled?: boolean;
  checkoutDisabledMessage?: string;
}

export const CartDrawer = ({
  isOpen,
  items,
  summary,
  onClose,
  onAddItem,
  onDecreaseItem,
  onRemoveItem,
  onCheckout,
  checkoutDisabled = false,
  checkoutDisabledMessage = "Finalizacao indisponivel."
}: CartDrawerProps) => (
  <div className={`cart-overlay ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
    <button className="cart-backdrop" type="button" onClick={onClose} aria-label="Fechar carrinho" />
    <aside className="cart-drawer" aria-label="Carrinho de pedido">
      <div className="cart-header">
        <div>
          <span>Seu pedido</span>
          <h2>Carrinho</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Fechar">
          <X size={20} />
        </button>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <ShoppingBag size={44} />
          <h3>Carrinho vazio</h3>
          <p>Adicione itens do cardapio para montar seu pedido.</p>
        </div>
      ) : (
        <div className="cart-items">
          {items.map((cartItem) => (
            <div className="cart-item" key={cartItem.item.id}>
              <img src={cartItem.item.image} alt="" loading="lazy" decoding="async" />
              <div>
                <h3>{cartItem.item.name}</h3>
                <p>{formatCurrency(cartItem.item.price)}</p>
                <div className="quantity-control">
                  <button type="button" onClick={() => onDecreaseItem(cartItem.item.id)} aria-label="Diminuir">
                    <Minus size={15} />
                  </button>
                  <strong>{cartItem.quantity}</strong>
                  <button type="button" onClick={() => onAddItem(cartItem.item)} aria-label="Aumentar">
                    <Plus size={15} />
                  </button>
                  <button
                    className="remove-button"
                    type="button"
                    onClick={() => onRemoveItem(cartItem.item.id)}
                    aria-label="Remover"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="cart-summary">
        <div>
          <span>Subtotal</span>
          <strong>{formatCurrency(summary.subtotal)}</strong>
        </div>
        <div>
          <span>Entrega</span>
          <strong>{formatCurrency(summary.deliveryFee)}</strong>
        </div>
        <div className="summary-total">
          <span>Total</span>
          <strong>{formatCurrency(summary.total)}</strong>
        </div>

        {/* BOTÕES NO FINAL DO CARRINHO */}
        <div style={{ padding: "20px", display: "flex", gap: "10px" }}>

          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "15px",
              backgroundColor: "#ffffff",
              color: "black",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold"
            }}
          >
            Adicionar mais
          </button>

          <button
            onClick={onCheckout}
            disabled={checkoutDisabled}
            style={{
              flex: 1,
              padding: "15px",
              backgroundColor: checkoutDisabled ? "#5f5b57" : "#ff6a00",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: "bold",
              cursor: checkoutDisabled ? "not-allowed" : "pointer"
            }}
          >
            {checkoutDisabled ? checkoutDisabledMessage : "Finalizar pedido"}
          </button>

        </div>
      </div>
    </aside>
  </div>
);

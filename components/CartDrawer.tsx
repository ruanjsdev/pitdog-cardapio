import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";

import { MenuItem } from "../types/menu";
import { CartItem } from "../types/order";
import { formatCurrency } from "../utils/currency";

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  extraItems: MenuItem[];
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

  onAddExtraToItem: (parentItemId: string, extraItem: MenuItem) => void;
  onDecreaseExtraFromItem: (parentItemId: string, extraItemId: string) => void;
  onRemoveExtraFromItem: (parentItemId: string, extraItemId: string) => void;
  onConfirmExtras: (itemName: string) => void;

  onCheckout: () => void;
  onAddMore?: () => void;
  checkoutDisabled?: boolean;
  checkoutDisabledMessage?: string;
}

export const CartDrawer = ({
  isOpen,
  items,
  extraItems,
  summary,
  onClose,
  onAddItem,
  onDecreaseItem,
  onRemoveItem,
  onAddExtraToItem,
  onDecreaseExtraFromItem,
  onRemoveExtraFromItem,
  onConfirmExtras,
  onCheckout,
  onAddMore,
  checkoutDisabled = false,
  checkoutDisabledMessage = "Finalização indisponível.",
}: CartDrawerProps) => {
  const [openExtrasForItem, setOpenExtrasForItem] = useState<string | null>(
    null
  );

  const handleAddMore = () => {
    if (onAddMore) {
      onAddMore();
      return;
    }

    onClose();
  };

  return (
    <div
      className={`cart-overlay ${isOpen ? "is-open" : ""}`}
      aria-hidden={!isOpen}
    >
      <button
        className="cart-backdrop"
        type="button"
        onClick={onClose}
        aria-label="Fechar carrinho"
      />

      <aside className="cart-drawer" aria-label="Carrinho de pedido">
        <div className="cart-header">
          <div>
            <span>Seu pedido</span>
            <h2>Carrinho</h2>
          </div>

          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="empty-cart">
            <ShoppingBag size={44} />
            <h3>Carrinho vazio</h3>
            <p>Adicione itens do cardápio para montar seu pedido.</p>
          </div>
        ) : (
          <div className="cart-items">
            {items.map((cartItem) => {
              const itemId = cartItem.item.id;
              const extrasIsOpen = openExtrasForItem === itemId;
              const isExtraItem = cartItem.item.categoryId === "extras";
              const extras = cartItem.extras ?? [];

              return (
                <div className="cart-item" key={itemId}>
                  <img
                    src={cartItem.item.image}
                    alt={cartItem.item.name}
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="cart-item-content">
                    <div className="cart-item-top">
                      <div>
                        <h3>{cartItem.item.name}</h3>
                        <p>{formatCurrency(cartItem.item.price)}</p>
                      </div>

                      {!isExtraItem && extraItems.length > 0 && (
                        <button
                          type="button"
                          className="cart-extras-button"
                          onClick={() =>
                            setOpenExtrasForItem((current) =>
                              current === itemId ? null : itemId
                            )
                          }
                        >
                          Adicionais
                        </button>
                      )}
                    </div>

                    <div className="quantity-control">
                      <button
                        type="button"
                        onClick={() => onDecreaseItem(itemId)}
                        aria-label="Diminuir"
                      >
                        <Minus size={15} />
                      </button>

                      <strong>{cartItem.quantity}</strong>

                      <button
                        type="button"
                        onClick={() => onAddItem(cartItem.item)}
                        aria-label="Aumentar"
                      >
                        <Plus size={15} />
                      </button>

                      <button
                        className="remove-button"
                        type="button"
                        onClick={() => onRemoveItem(itemId)}
                        aria-label="Remover"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {extras.length > 0 && (
                      <div className="cart-selected-extras">
                        <strong>Adicionais:</strong>

                        {extras.map((extra) => (
                          <div
                            className="cart-selected-extra"
                            key={extra.item.id}
                          >
                            <span>
                              + {extra.item.name} x{extra.quantity}
                            </span>

                            <div className="cart-selected-extra-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  onDecreaseExtraFromItem(
                                    itemId,
                                    extra.item.id
                                  )
                                }
                                aria-label="Diminuir adicional"
                              >
                                <Minus size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  onAddExtraToItem(itemId, extra.item)
                                }
                                aria-label="Aumentar adicional"
                              >
                                <Plus size={13} />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  onRemoveExtraFromItem(itemId, extra.item.id)
                                }
                                aria-label="Remover adicional"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isExtraItem && extrasIsOpen && extraItems.length > 0 && (
                      <div className="cart-extras-modal">
                        <div className="cart-extras-modal-header">
                          <div>
                            <strong>Escolha os adicionais</strong>
                            <span>Para: {cartItem.item.name}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setOpenExtrasForItem(null)}
                            aria-label="Fechar adicionais"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        <div className="cart-extras-list">
                          {extraItems.map((extra) => {
                            const selectedExtra = extras.find(
                              (item) => item.item.id === extra.id
                            );

                            return (
                              <div
                                key={extra.id}
                                className="cart-extra-option-row"
                              >
                                <div>
                                  <span>{extra.name}</span>
                                  <strong>
                                    + {formatCurrency(extra.price)}
                                  </strong>
                                </div>

                                <div className="cart-extra-option-actions">
                                  {selectedExtra && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        onDecreaseExtraFromItem(
                                          itemId,
                                          extra.id
                                        )
                                      }
                                      aria-label="Diminuir adicional"
                                    >
                                      <Minus size={14} />
                                    </button>
                                  )}

                                  <strong>{selectedExtra?.quantity ?? 0}</strong>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      onAddExtraToItem(itemId, extra)
                                    }
                                    aria-label="Adicionar adicional"
                                  >
                                    <Plus size={14} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <button
                          type="button"
                          className="cart-extras-confirm"
                          onClick={() => {
                            setOpenExtrasForItem(null);
                            onConfirmExtras(cartItem.item.name);
                          }}
                        >
                          Confirmar adicionais
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
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

          <div style={{ padding: "20px", display: "flex", gap: "10px" }}>
            <button
              onClick={handleAddMore}
              style={{
                flex: 1,
                padding: "15px",
                backgroundColor: "#ffffff",
                color: "black",
                border: "none",
                borderRadius: "8px",
                fontWeight: "bold",
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
                cursor: checkoutDisabled ? "not-allowed" : "pointer",
              }}
            >
              {checkoutDisabled ? checkoutDisabledMessage : "Finalizar pedido"}
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
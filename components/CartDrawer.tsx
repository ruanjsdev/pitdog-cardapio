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
  onUpdateItemNotes: (itemId: string, notes: string) => void;

  onAddExtraToItem: (parentItemId: string, extraItem: MenuItem) => void;
  onDecreaseExtraFromItem: (parentItemId: string, extraItemId: string) => void;
  onRemoveExtraFromItem: (parentItemId: string, extraItemId: string) => void;
  onConfirmExtras: (itemName: string) => void;

  onCheckout: () => void;
  onAddMore?: () => void;
  minimumOrder?: number;
  missingMinimum?: number;
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
  onUpdateItemNotes,
  onAddExtraToItem,
  onDecreaseExtraFromItem,
  onRemoveExtraFromItem,
  onConfirmExtras,
  onCheckout,
  onAddMore,
  minimumOrder = 0,
  missingMinimum = 0,
  checkoutDisabled = false,
  checkoutDisabledMessage = "Finalização indisponível.",
}: CartDrawerProps) => {
  const [openExtrasForItem, setOpenExtrasForItem] = useState<string | null>(
    null
  );
  const [openFlavorForItem, setOpenFlavorForItem] = useState<string | null>(
    null
  );

  const handleAddMore = () => {
    if (onAddMore) {
      onAddMore();
      return;
    }

    onClose();
  };

  const quickNotes = ["sem cebola", "sem milho", "molho separado", "bem passado"];
  const normalizeText = (value = "") =>
    value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

  const isBeverageItem = (item: MenuItem) => {
    const searchable = normalizeText(`${item.name} ${item.description}`);

    return [
      "agua",
      "bebida",
      "cerveja",
      "corona",
      "energetico",
      "h2o",
      "refrigerante",
      "redbull",
      "refri",
      "skol",
      "suco",
    ].some((term) => searchable.includes(term));
  };

  const getSelectedFlavor = (notes = "", flavorOptions: string[]) => {
    const normalizedNotes = normalizeText(notes);

    return flavorOptions.find((flavor) => normalizedNotes === normalizeText(flavor)) ?? "";
  };

  const selectFlavor = (itemId: string, flavor: string) => {
    onUpdateItemNotes(itemId, flavor);
  };

  const getAvailableExtras = (item: MenuItem) => {
    const linkedAddonIds = item.addonIds;

    return Array.isArray(linkedAddonIds)
      ? extraItems.filter((extra) => linkedAddonIds.includes(extra.id))
      : extraItems;
  };

  const extrasModalItem = items.find((cartItem) => cartItem.item.id === openExtrasForItem);
  const extrasModalOptions = extrasModalItem ? getAvailableExtras(extrasModalItem.item) : [];
  const extrasModalSelected = extrasModalItem?.extras ?? [];
  const flavorModalItem = items.find((cartItem) => cartItem.item.id === openFlavorForItem);
  const flavorModalOptions = flavorModalItem?.item.options ?? [];
  const flavorModalSelected = flavorModalItem
    ? getSelectedFlavor(flavorModalItem.notes, flavorModalOptions)
    : "";

  const toggleQuickNote = (itemId: string, note: string, currentNotes = "") => {
    const parts = currentNotes
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const nextParts = parts.includes(note)
      ? parts.filter((part) => part !== note)
      : [...parts, note];

    onUpdateItemNotes(itemId, nextParts.join(", "));
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
              const isExtraItem = cartItem.item.type === "ADDITIONAL" || cartItem.item.categoryId === "extras";
              const availableExtraItems = getAvailableExtras(cartItem.item);
              const canUseExtras = cartItem.item.allowsAdditionals === true && availableExtraItems.length > 0;
              const extras = cartItem.extras ?? [];
              const flavorOptions = cartItem.item.options ?? [];
              const selectedFlavor = getSelectedFlavor(cartItem.notes, flavorOptions);
              const isBeverage = isBeverageItem(cartItem.item);

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

                      {!isExtraItem && canUseExtras && (
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

                      {!isExtraItem && isBeverage && flavorOptions.length > 0 && (
                        <button
                          type="button"
                          className={`cart-extras-button ${selectedFlavor ? "is-selected" : ""}`}
                          onClick={() =>
                            setOpenFlavorForItem((current) =>
                              current === itemId ? null : itemId
                            )
                          }
                        >
                          {selectedFlavor || "Sabor"}
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

                    {!isExtraItem && isBeverage && selectedFlavor && (
                      <div className="cart-selected-extras">
                        <strong>Sabor escolhido:</strong>
                        <div className="cart-selected-extra">
                          <span>{selectedFlavor}</span>
                          <button
                            type="button"
                            className="cart-change-flavor-button"
                            onClick={() => setOpenFlavorForItem(itemId)}
                          >
                            Trocar
                          </button>
                        </div>
                      </div>
                    )}

                    {!isExtraItem && !isBeverage && (
                      <label className="cart-item-notes">
                        <span>Observação do item</span>
                        <div className="quick-note-chips">
                          {quickNotes.map((note) => {
                            const isActive = (cartItem.notes ?? "")
                              .split(",")
                              .map((part) => part.trim())
                              .includes(note);

                            return (
                              <button
                                key={note}
                                type="button"
                                className={isActive ? "is-selected" : ""}
                                onClick={() => toggleQuickNote(itemId, note, cartItem.notes)}
                              >
                                {note}
                              </button>
                            );
                          })}
                        </div>
                        <textarea
                          value={cartItem.notes ?? ""}
                          onChange={(event) => onUpdateItemNotes(itemId, event.target.value)}
                          placeholder="Ex: sem cebola, ponto da carne, molho separado..."
                        />
                      </label>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="cart-summary">
          {minimumOrder > 0 && (
            <div className={`cart-minimum ${missingMinimum > 0 ? "is-missing" : "is-ok"}`}>
              <span>Pedido mínimo</span>
              <strong>
                {missingMinimum > 0
                  ? `Faltam ${formatCurrency(missingMinimum)}`
                  : `Atingido: ${formatCurrency(minimumOrder)}`}
              </strong>
            </div>
          )}

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

      {extrasModalItem && extrasModalOptions.length > 0 && (
        <div className="cart-extras-screen" role="dialog" aria-modal="true" aria-label="Escolher adicionais">
          <button
            className="cart-extras-screen-backdrop"
            type="button"
            onClick={() => setOpenExtrasForItem(null)}
            aria-label="Fechar adicionais"
          />

          <section className="cart-extras-modal">
            <div className="cart-extras-modal-header">
              <div>
                <strong>Escolha os adicionais</strong>
                <span>Para: {extrasModalItem.item.name}</span>
              </div>

              <button
                type="button"
                onClick={() => setOpenExtrasForItem(null)}
                aria-label="Fechar adicionais"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cart-extras-list">
              {extrasModalOptions.map((extra) => {
                const selectedExtra = extrasModalSelected.find(
                  (item) => item.item.id === extra.id
                );

                return (
                  <div key={extra.id} className="cart-extra-option-row">
                    <div>
                      <span>{extra.name}</span>
                      <strong>+ {formatCurrency(extra.price)}</strong>
                    </div>

                    <div className="cart-extra-option-actions">
                      <button
                        type="button"
                        onClick={() => onDecreaseExtraFromItem(extrasModalItem.item.id, extra.id)}
                        disabled={!selectedExtra}
                        aria-label="Diminuir adicional"
                      >
                        <Minus size={14} />
                      </button>

                      <strong>{selectedExtra?.quantity ?? 0}</strong>

                      <button
                        type="button"
                        onClick={() => onAddExtraToItem(extrasModalItem.item.id, extra)}
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
                onConfirmExtras(extrasModalItem.item.name);
              }}
            >
              Confirmar adicionais
            </button>
          </section>
        </div>
      )}

      {flavorModalItem && flavorModalOptions.length > 0 && (
        <div className="cart-extras-screen" role="dialog" aria-modal="true" aria-label="Escolher sabor">
          <button
            className="cart-extras-screen-backdrop"
            type="button"
            onClick={() => setOpenFlavorForItem(null)}
            aria-label="Fechar sabores"
          />

          <section className="cart-extras-modal cart-flavor-modal">
            <div className="cart-extras-modal-header">
              <div>
                <strong>Escolha o sabor</strong>
                <span>Para: {flavorModalItem.item.name}</span>
              </div>

              <button
                type="button"
                onClick={() => setOpenFlavorForItem(null)}
                aria-label="Fechar sabores"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cart-flavor-list">
              {flavorModalOptions.map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  className={flavorModalSelected === flavor ? "is-selected" : ""}
                  onClick={() => {
                    selectFlavor(flavorModalItem.item.id, flavor);
                    setOpenFlavorForItem(null);
                  }}
                >
                  <span>{flavor}</span>
                  {flavorModalSelected === flavor && <strong>Escolhido</strong>}
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

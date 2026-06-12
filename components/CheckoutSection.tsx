import {
  X,
  Bike,
  MapPin,
  PackageCheck,
  Send,
  Store,
  Utensils
} from "lucide-react";

import { FormEvent, useEffect, useState } from "react";
import { hasApiUrl } from "../services/apiClient";
import { createOrderDraft } from "../services/orderService";
import { createPixPaymentIntent } from "../services/paymentService";
import { CheckoutForm, CreatedOrder, OrderDraft } from "../types/order";
import { StoreConfig } from "../types/store";
import { formatCurrency } from "../utils/currency";

interface CheckoutSectionProps {
  checkout: CheckoutForm;
  setCheckout: (checkout: CheckoutForm) => void;
  orderDraft: OrderDraft;
  storeConfig: StoreConfig;
  cartIsEmpty: boolean;
  missingMinimum?: number;
  onClose: () => void;
  onFinishOrder: (order: CreatedOrder) => void;
}

export const CheckoutSection = ({
  checkout,
  setCheckout,
  orderDraft,
  storeConfig,
  cartIsEmpty,
  missingMinimum = 0,
  onClose,
  onFinishOrder
}: CheckoutSectionProps) => {
  const [status, setStatus] = useState<"idle" | "loading" | "ready">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const [addressOpen, setAddressOpen] = useState(false);
  const isTableOrder = checkout.fulfillment === "table";
  const deliveryAddressPreview = [
    checkout.deliveryAddress.street,
    checkout.deliveryAddress.number,
    checkout.deliveryAddress.neighborhood,
  ].filter(Boolean).join(", ");
  const hasRequiredDeliveryAddress = Boolean(
    checkout.deliveryAddress.street.trim() &&
      checkout.deliveryAddress.number.trim() &&
      checkout.deliveryAddress.neighborhood.trim()
  );

  const updateField = (
    field: keyof CheckoutForm,
    value: CheckoutForm[keyof CheckoutForm]
  ) => {
    setCheckout({
      ...checkout,
      [field]: value
    });
  };

  useEffect(() => {
    if (checkout.fulfillment === "delivery" && !storeConfig.aceitaEntrega) {
      updateField("fulfillment", storeConfig.aceitaRetirada ? "pickup" : "table");
    }

    if (checkout.fulfillment === "pickup" && !storeConfig.aceitaRetirada) {
      updateField("fulfillment", storeConfig.aceitaEntrega ? "delivery" : "table");
    }

    if (checkout.fulfillment === "table" && !storeConfig.aceitaMesa) {
      updateField("fulfillment", storeConfig.aceitaEntrega ? "delivery" : "pickup");
    }

    if (checkout.fulfillment === "table") {
      return;
    }

    if (checkout.paymentMethod === "pix" && !storeConfig.aceitaPix) {
      updateField("paymentMethod", storeConfig.aceitaCartao ? "card" : "cash");
    }

    if (checkout.paymentMethod === "card" && !storeConfig.aceitaCartao) {
      updateField("paymentMethod", storeConfig.aceitaPix ? "pix" : "cash");
    }

    if (checkout.paymentMethod === "cash" && !storeConfig.aceitaDinheiro) {
      updateField("paymentMethod", storeConfig.aceitaPix ? "pix" : "card");
    }
  }, [checkout.fulfillment, checkout.paymentMethod, storeConfig]);

  // ✅ SUBMIT CORRIGIDO (SEM DUPLICAÇÃO)
  const submitOrder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (cartIsEmpty) {
      setErrorMessage("Nao e possivel enviar pedido vazio.");
      return;
    }
    if (missingMinimum > 0) {
      setErrorMessage(`Faltam ${formatCurrency(missingMinimum)} para atingir o pedido minimo.`);
      return;
    }
    if (!storeConfig.lojaAberta) {
      setErrorMessage(storeConfig.mensagemLojaFechada);
      return;
    }
    if (
      checkout.fulfillment === "delivery" &&
      (!checkout.deliveryAddress.street ||
        !checkout.deliveryAddress.number ||
        !checkout.deliveryAddress.neighborhood)
    ) {
      setAddressOpen(true);
      setErrorMessage("Preencha rua, numero e bairro para entrega.");
      return;
    }
    if (isTableOrder && !checkout.tableNumber.trim()) {
      setErrorMessage("Informe o numero da mesa.");
      return;
    }
    if (!isTableOrder && !checkout.phone.replace(/\D/g, "")) {
      setErrorMessage("Informe um WhatsApp valido.");
      return;
    }

    setStatus("loading");
    setErrorMessage("");

    try {
      const createdOrder = await createOrderDraft(orderDraft);

      if (!isTableOrder && checkout.paymentMethod === "pix" && !hasApiUrl) {
        await createPixPaymentIntent(orderDraft);
      }

      onFinishOrder(createdOrder);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Nao foi possivel enviar o pedido.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <section className="section checkout-section" id="checkout">

      {/* HEADER */}
      <div className="checkout-copy">
        <span>Finalização por etapas</span>
        <h2>Escolha o pedido, defina como receber e finalize.</h2>
        <p>Escolha como deseja receber seu pedido e finalize em poucos segundos.</p>
      </div>

      {/* FORM */}
      <form className="checkout-form" onSubmit={submitOrder}>

        {/* TOP */}
        <div className="checkout-topbar">
          <button type="button" className="checkout-close" onClick={onClose}>
            <X size={20} />
            Voltar ao cardápio
          </button>
        </div>

        {/* TOTAL */}
        <div className="form-header">
          <div>
            <span>Total do pedido</span>
            <strong>{formatCurrency(orderDraft.total)}</strong>
          </div>
        </div>

        <div className="checkout-totals">
          <div>
            <span>Subtotal</span>
            <strong>{formatCurrency(orderDraft.subtotal)}</strong>
          </div>
          <div>
            <span>{checkout.fulfillment === "delivery" ? "Taxa de entrega" : "Taxa"}</span>
            <strong>{formatCurrency(orderDraft.deliveryFee)}</strong>
          </div>
          {storeConfig.pedidoMinimo > 0 && (
            <div className={missingMinimum > 0 ? "is-warning" : "is-ok"}>
              <span>Pedido mínimo</span>
              <strong>
                {missingMinimum > 0
                  ? `Faltam ${formatCurrency(missingMinimum)}`
                  : formatCurrency(storeConfig.pedidoMinimo)}
              </strong>
            </div>
          )}
          <div className="is-total">
            <span>Total</span>
            <strong>{formatCurrency(orderDraft.total)}</strong>
          </div>
        </div>

        {/* INFO */}
        <div className="info-bubble">
          <span className="info-bubble-title">Como funciona?</span>
          <p>Escolha uma das 3 formas disponíveis para receber seu pedido.</p>
        </div>

        {/* ENTREGA */}
        <div className="fulfillment-grid">

          {storeConfig.aceitaEntrega && <button
            type="button"
            className={checkout.fulfillment === "delivery" ? "is-selected" : ""}
            onClick={() => updateField("fulfillment", "delivery")}
          >
            <Bike size={22} />
            <b>Entrega</b>
            <small>Receber em casa</small>
          </button>}

          {storeConfig.aceitaRetirada && <button
            type="button"
            className={checkout.fulfillment === "pickup" ? "is-selected" : ""}
            onClick={() => updateField("fulfillment", "pickup")}
          >
            <Store size={22} />
            <b>Retirada</b>
            <small>Buscar no balcão</small>
          </button>}

          {storeConfig.aceitaMesa && <button
            type="button"
            className={checkout.fulfillment === "table" ? "is-selected" : ""}
            onClick={() => updateField("fulfillment", "table")}
          >
            <Utensils size={22} />
            <b>Mesa</b>
            <small>Consumir no local</small>
          </button>}

        </div>

        {/* ITENS */}
        <div className="order-mini-list">
          {orderDraft.items.map((cartItem) => (
            <div key={cartItem.cartId ?? cartItem.item.id}>
              <span>{cartItem.quantity}x {cartItem.item.name}</span>
              <strong>{formatCurrency(cartItem.item.price * cartItem.quantity)}</strong>
            </div>
          ))}
        </div>

        {/* NOME */}
        <label>
          Nome
          <input
            value={checkout.customerName}
            onChange={(e) => updateField("customerName", e.target.value)}
            placeholder="Seu nome"
            required
          />
        </label>

        {/* ENDEREÇO */}
        {checkout.fulfillment === "delivery" && (
          <div className="address-block">

            <span className="section-title">Endereço de entrega</span>

            <button
              type="button"
              className="address-button"
              onClick={() => setAddressOpen(!addressOpen)}
            >
              <MapPin size={18} />
              {hasRequiredDeliveryAddress ? "Editar endereço" : "Adicionar endereço"}
            </button>

            {hasRequiredDeliveryAddress && (
              <p className="address-preview">
                {deliveryAddressPreview}
                {checkout.deliveryAddress.complement ? ` - ${checkout.deliveryAddress.complement}` : ""}
              </p>
            )}

            {addressOpen && (
              <div className="address-panel">

                <input
                  placeholder="Rua"
                  value={checkout.deliveryAddress.street}
                  onChange={(e) =>
                    updateField("deliveryAddress", { ...checkout.deliveryAddress, street: e.target.value })
                  }
                  required
                />

                <input
                  placeholder="Número"
                  value={checkout.deliveryAddress.number}
                  onChange={(e) =>
                    updateField("deliveryAddress", { ...checkout.deliveryAddress, number: e.target.value })
                  }
                  required
                />

                <input
                  placeholder="Bairro"
                  value={checkout.deliveryAddress.neighborhood}
                  onChange={(e) =>
                    updateField("deliveryAddress", { ...checkout.deliveryAddress, neighborhood: e.target.value })
                  }
                  required
                />

                <input
                  placeholder="Complemento"
                  value={checkout.deliveryAddress.complement}
                  onChange={(e) =>
                    updateField("deliveryAddress", { ...checkout.deliveryAddress, complement: e.target.value })
                  }
                />

                <input
                  placeholder="Referência"
                  value={checkout.deliveryAddress.reference}
                  onChange={(e) =>
                    updateField("deliveryAddress", { ...checkout.deliveryAddress, reference: e.target.value })
                  }
                />

                <button
                  type="button"
                  className="address-confirm"
                  disabled={!hasRequiredDeliveryAddress}
                  onClick={() => {
                    if (!hasRequiredDeliveryAddress) {
                      setErrorMessage("Preencha rua, numero e bairro para entrega.");
                      return;
                    }

                    updateField(
                      "address",
                      `${checkout.deliveryAddress.street}, ${checkout.deliveryAddress.number} - ${checkout.deliveryAddress.neighborhood}${checkout.deliveryAddress.complement ? `, ${checkout.deliveryAddress.complement}` : ""}`
                    );

                    setAddressOpen(false);
                  }}
                >
                  Confirmar endereço
                </button>

              </div>
            )}

          </div>
        )}

        {/* WHATSAPP */}
        {!isTableOrder && (
          <label>
            WhatsApp
            <input
              value={checkout.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="(91) 99999-9999"
              required
            />
          </label>
        )}

        {/* MESA */}
        {checkout.fulfillment === "table" && (
          <label>
            Número da mesa
            <input
              value={checkout.tableNumber}
              onChange={(e) => updateField("tableNumber", e.target.value)}
              placeholder="Ex: mesa 04"
              required
            />
          </label>
        )}

        {/* PAGAMENTO */}
        {!isTableOrder && (
        <div className="payment-section">

          <span className="payment-title">Forma de pagamento</span>

          <div className="payment-grid">

            {storeConfig.aceitaPix && <button type="button" className={checkout.paymentMethod === "pix" ? "is-selected" : ""} onClick={() => updateField("paymentMethod", "pix")}>PIX</button>}

            {storeConfig.aceitaCartao && <button type="button" className={checkout.paymentMethod === "card" ? "is-selected" : ""} onClick={() => updateField("paymentMethod", "card")}>Cartão</button>}

            {storeConfig.aceitaDinheiro && <button type="button" className={checkout.paymentMethod === "cash" ? "is-selected" : ""} onClick={() => updateField("paymentMethod", "cash")}>Dinheiro</button>}

          </div>

          {/* CARTÃO */}
          {checkout.paymentMethod === "card" && (
            <div className="payment-extra">

              <button type="button" className={checkout.cardType === "credit" ? "is-selected" : ""} onClick={() => updateField("cardType", "credit")}>Crédito</button>

              <button type="button" className={checkout.cardType === "debit" ? "is-selected" : ""} onClick={() => updateField("cardType", "debit")}>Débito</button>

            </div>
          )}

          {/* DINHEIRO */}
          {checkout.paymentMethod === "cash" && (
            <div className="payment-extra">

              <button
                type="button"
                className={!checkout.needsChange ? "is-selected" : ""}
                onClick={() =>
                  setCheckout({
                    ...checkout,
                    needsChange: false,
                    changeFor: ""
                  })
                }
              >
                Pagamento exato
              </button>

              <button
                type="button"
                className={checkout.needsChange ? "is-selected" : ""}
                onClick={() =>
                  setCheckout({
                    ...checkout,
                    needsChange: true
                  })
                }
              >
                Preciso de troco
              </button>

              {checkout.needsChange && (
                <div className="change-input">
                  <input
                    value={checkout.changeFor}
                    onChange={(e) =>
                      updateField("changeFor", e.target.value)
                    }
                    placeholder="Troco para quanto? Ex: R$ 100"
                  />
                </div>
              )}

            </div>
          )}

          {checkout.paymentMethod === "pix" && (
            <p className="pix-checkout-hint">
              A chave PIX será enviada separadamente no WhatsApp após o pedido chegar no caixa.
            </p>
          )}

        </div>
        )}

        {errorMessage && <div className="form-error">{errorMessage}</div>}

        {/* BOTÃO */}
        <button
          className="primary-button full"
          type="submit"
          disabled={cartIsEmpty || status === "loading" || !storeConfig.lojaAberta || missingMinimum > 0}
        >
          {!storeConfig.lojaAberta
            ? "Loja fechada"
            : missingMinimum > 0
            ? `Faltam ${formatCurrency(missingMinimum)}`
            : status === "loading"
            ? "Preparando pedido..."
            : <>Finalizar pedido <Send size={18} /></>}
        </button>

        {/* NOTA */}
        <div className="checkout-note">
          {checkout.fulfillment === "delivery" ? <MapPin size={16} /> : <PackageCheck size={16} />}

          <span>
            {checkout.fulfillment === "delivery"
              ? "Taxa aplicada apenas para entrega."
              : "Sem taxa para retirada ou mesa."}
          </span>
        </div>

      </form>
    </section>
  );
};

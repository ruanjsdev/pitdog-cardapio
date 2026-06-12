import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { AboutSection } from "../components/AboutSection";
import { CartDrawer } from "../components/CartDrawer";
import { CheckoutSection } from "../components/CheckoutSection";
import { ContactSection } from "../components/ContactSection";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { LoadingScreen } from "../components/LoadingScreen";
import { MenuSection } from "../components/MenuSection";

import { useCart } from "../hooks/useCart";
import { getPublicMenu } from "../services/menuService";
import { fallbackStoreConfig, getStoreConfig } from "../services/storeService";
import { MenuCategory, MenuItem } from "../types/menu";
import { CheckoutForm, CreatedOrder } from "../types/order";
import { formatCurrency } from "../utils/currency";

const STORAGE_CHECKOUT_KEY = "pits-dog-checkout";
const MIN_LOADING_TIME = 2200;
const DEFAULT_PIX_KEY = "41172968000182";

const orderStatusLabels: Record<string, string> = {
  AGUARDANDO_APROVACAO: "Aguardando aprovação",
  CANCELADO: "Cancelado",
  EM_PREPARO: "Em preparo",
  FINALIZADO: "Finalizado",
  PRONTO: "Pronto",
  SAIU_PARA_ENTREGA: "Saiu para entrega",
  aceito: "Aceito",
  cancelado: "Cancelado",
  em_preparo: "Em preparo",
  finalizado: "Finalizado",
  pendente: "Aguardando aprovação",
  pronto_para_retirada: "Pronto para retirada",
  saiu_para_entrega: "Saiu para entrega",
};

const initialCheckout: CheckoutForm = {
  customerName: "",
  phone: "",
  fulfillment: "delivery",
  address: "",
  deliveryAddress: {
    street: "",
    number: "",
    neighborhood: "",
    complement: "",
    reference: "",
  },
  tableNumber: "",
  paymentMethod: "pix",
  cardType: "credit",
  needsChange: false,
  changeFor: "",
  notes: "",
};

const loadCheckout = (): CheckoutForm => {
  try {
    const saved = localStorage.getItem(STORAGE_CHECKOUT_KEY);
    if (!saved) return initialCheckout;

    const parsed = JSON.parse(saved);

    return {
      ...initialCheckout,
      ...parsed,
      notes: "",
      deliveryAddress: {
        ...initialCheckout.deliveryAddress,
        ...(parsed.deliveryAddress ?? {}),
      },
    };
  } catch {
    return initialCheckout;
  }
};

type AddedPopup = {
  tone?: "success" | "danger";
  title: string;
  message: string;
};

export const App = () => {
  const cart = useCart();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [addedPopup, setAddedPopup] = useState<AddedPopup | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuLoading, setIsMenuLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [storeConfig, setStoreConfig] = useState(fallbackStoreConfig);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [products, setProducts] = useState<MenuItem[]>([]);
  const [hasConfirmedMenuLoad, setHasConfirmedMenuLoad] = useState(false);
  const [finishedPaymentMethod, setFinishedPaymentMethod] = useState<CheckoutForm["paymentMethod"] | null>(null);
  const [finishedOrder, setFinishedOrder] = useState<CreatedOrder | null>(null);
  const [pendingFlavorItem, setPendingFlavorItem] = useState<MenuItem | null>(null);
  const [pixCopied, setPixCopied] = useState(false);

  const [checkout, setCheckout] = useState<CheckoutForm>(() => loadCheckout());

  useEffect(() => {
    localStorage.setItem(STORAGE_CHECKOUT_KEY, JSON.stringify(checkout));
  }, [checkout]);

  useEffect(() => {
    let isMounted = true;

    let isApiLoadPending = false;
    let lastRefreshAt = Date.now();
    const refreshIntervalMs = 5 * 60 * 1000; // 5 minutos

    const loadApiData = async (showLoading = true) => {
      if (isApiLoadPending) return;
      isApiLoadPending = true;

      if (showLoading) {
        setIsMenuLoading(true);
      }

      const [nextStoreConfigResult, nextMenuResult] = await Promise.allSettled([
        getStoreConfig(),
        getPublicMenu(),
      ]);

      if (!isMounted) return;

      if (nextStoreConfigResult.status === "fulfilled") {
        setStoreConfig(nextStoreConfigResult.value);
      } else {
        console.warn("Nao foi possivel carregar o status da loja.", nextStoreConfigResult.reason);
      }

      if (nextMenuResult.status === "fulfilled") {
        const nextCategories = nextMenuResult.value.categories;
        const nextProducts = nextMenuResult.value.products;
        const hasVisibleMenu =
          nextCategories.length > 0 &&
          nextProducts.some((item) => item.type !== "ADDITIONAL");

        setCategories(nextCategories);
        setProducts(nextProducts);

        if (hasVisibleMenu) {
          setHasConfirmedMenuLoad(true);
        }
      } else {
        console.warn("Nao foi possivel carregar o cardapio.", nextMenuResult.reason);
      }

      if (showLoading) {
        setIsMenuLoading(false);
      }

      isApiLoadPending = false;
    };

    loadApiData();

    const refreshMenu = () => {
      const now = Date.now();
      if (isApiLoadPending || now - lastRefreshAt < refreshIntervalMs) return;
      lastRefreshAt = now;
      void loadApiData(false);
    };

    const refreshVisibleMenu = () => {
      if (document.visibilityState === "visible") {
        refreshMenu();
      }
    };
    const refreshTimer = window.setInterval(refreshMenu, refreshIntervalMs);

    window.addEventListener("focus", refreshMenu);
    document.addEventListener("visibilitychange", refreshVisibleMenu);

    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener("focus", refreshMenu);
      document.removeEventListener("visibilitychange", refreshVisibleMenu);
    };
  }, []);

  useEffect(() => {
    if (isCartOpen || showCheckout || pendingFlavorItem) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isCartOpen, pendingFlavorItem, showCheckout]);

  useEffect(() => {
    const guardState = { pitsDogBackGuard: true };

    if (!window.history.state?.pitsDogBackGuard) {
      window.history.replaceState({ pitsDogHome: true }, "", window.location.href);
      window.history.pushState(guardState, "", window.location.href);
    }

    const handleBackButton = () => {
      if (showSuccess) {
        setShowSuccess(false);
      } else if (showCheckout) {
        setShowCheckout(false);
      } else if (isCartOpen) {
        setIsCartOpen(false);
      } else if (window.scrollY > 80) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      window.history.pushState(guardState, "", window.location.href);
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [isCartOpen, showCheckout, showSuccess]);

  useEffect(() => {
    if (isMenuLoading || !hasConfirmedMenuLoad || cart.items.length === 0) return;

    const availableProductIds = new Set(products.map((item) => item.id));
    const hasUnavailableItem =
      cart.items.some((cartItem) => !availableProductIds.has(cartItem.item.id));

    if (hasUnavailableItem) {
      cart.clearCart();
    }
  }, [cart, hasConfirmedMenuLoad, isMenuLoading, products]);

  useEffect(() => {
    let didCancel = false;
    let pageLoaded = document.readyState === "complete";

    const startedAt = performance.now();

    const finishLoading = () => {
      if (!pageLoaded || didCancel) return;

      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(0, MIN_LOADING_TIME - elapsed);

      window.setTimeout(() => {
        if (!didCancel) {
          setIsLoading(false);
        }
      }, remaining);
    };

    const handleLoad = () => {
      pageLoaded = true;
      finishLoading();
    };

    if (pageLoaded) {
      finishLoading();
    } else {
      window.addEventListener("load", handleLoad, { once: true });
    }

    return () => {
      didCancel = true;
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  const orderDraft = useMemo(() => {
    const deliveryFee =
      showCheckout &&
        checkout.fulfillment === "delivery" &&
        cart.items.length > 0
        ? storeConfig.taxaEntrega
        : 0;

    return {
      items: cart.items,
      subtotal: cart.summary.subtotal,
      deliveryFee,
      total: cart.summary.subtotal + deliveryFee,
      checkout,
    };
  }, [
    cart.items,
    cart.summary.subtotal,
    checkout,
    showCheckout,
    storeConfig.taxaEntrega,
  ]);

  const cartSummary = useMemo(
    () => ({
      ...cart.summary,
      deliveryFee: orderDraft.deliveryFee,
      total: orderDraft.total,
    }),
    [cart.summary, orderDraft]
  );

  const extraItems = useMemo(
    () => products.filter((item) => item.categoryId === "extras"),
    [products]
  );

  const minimumOrder = Math.max(0, storeConfig.pedidoMinimo ?? 0);
  const missingMinimum = Math.max(0, minimumOrder - cart.summary.subtotal);
  const minimumReached = missingMinimum <= 0;
  const checkoutPixKey = storeConfig.chavePix?.trim() || DEFAULT_PIX_KEY;

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.id !== "extras"),
    [categories]
  );

  const visibleProducts = useMemo(
    () => products.filter((item) => item.type !== "ADDITIONAL" && item.categoryId !== "extras"),
    [products]
  );

  const showPopup = (title: string, message: string, tone: AddedPopup["tone"] = "success") => {
    setAddedPopup({
      tone,
      title,
      message,
    });

    setTimeout(() => {
      setAddedPopup(null);
    }, 2200);
  };

  const showAddedItemPopup = (item: MenuItem) => {
    showPopup("Adicionado ao pedido", item.name);
  };

  const addMenuItem = (item: MenuItem, flavor = "") => {
    cart.addItem(item, flavor);
    showAddedItemPopup(item);
  };

  const requestAddMenuItem = (item: MenuItem) => {
    if (!storeConfig.lojaAberta) {
      showStoreClosedPopup();
      return;
    }

    if ((item.options ?? []).length > 0) {
      setPendingFlavorItem(item);
      return;
    }

    addMenuItem(item);
  };

  const showStoreClosedPopup = () => {
    showPopup(
      "Loja fechada",
      storeConfig.mensagemLojaFechada || "A loja está fechada no momento. Tente novamente mais tarde.",
      "danger"
    );
  };

  return (
    <>
      <div className={`bg-rain ${storeConfig.lojaAberta ? "" : "is-store-closed"}`} aria-hidden="true" />

      {!storeConfig.lojaAberta && (
        <div className="closed-store-top-alert" role="status">
          <strong>Loja fechada</strong>
          <span>{storeConfig.mensagemLojaFechada || "Pedidos pausados no momento."}</span>
        </div>
      )}

      {isLoading && <LoadingScreen />}

      <Header
        cartCount={cart.summary.count}
        onCartOpen={() => setIsCartOpen(true)}
      />

      <main>
        <Hero
          onOrderClick={() =>
            document.getElementById("cardapio")?.scrollIntoView({
              behavior: "smooth",
            })
          }
        />

        <MenuSection
          categories={visibleCategories}
          products={visibleProducts}
          isLoading={isMenuLoading}
          storeConfig={storeConfig}
          onClosedAttempt={showStoreClosedPopup}
          getItemQuantity={(itemId) => {
            return cart.items
              .filter((cartItem: any) => String(cartItem.item?.id ?? cartItem.productId) === String(itemId))
              .reduce((total, cartItem) => total + cartItem.quantity, 0);
          }}
          onAddItem={requestAddMenuItem}
        />

        {addedPopup && (
          <div className={`added-item-popup ${addedPopup.tone === "danger" ? "is-danger" : ""}`}>
            <strong>{addedPopup.title}</strong>
            <span>{addedPopup.message}</span>
          </div>
        )}

        <AboutSection />
        <ContactSection />
      </main>

      <Footer />

      {isCartOpen && (
        <CartDrawer
          isOpen={isCartOpen}
          items={cart.items}
          summary={cartSummary}
          extraItems={extraItems}
          onClose={() => setIsCartOpen(false)}
          onAddItem={(item, notes) => {
            if (!storeConfig.lojaAberta) {
              showStoreClosedPopup();
              return;
            }

            cart.addItem(item, notes);
            showAddedItemPopup(item);
          }}
          onDecreaseItem={cart.decreaseItem}
          onRemoveItem={cart.removeItem}
          onUpdateItemNotes={cart.updateItemNotes}
          onAddExtraToItem={(parentItemId: string, extraItem: MenuItem) => {
            if (!storeConfig.lojaAberta) {
              showStoreClosedPopup();
              return;
            }

            cart.addExtraToItem(parentItemId, extraItem);
          }}
          onDecreaseExtraFromItem={cart.decreaseExtraFromItem}
          onRemoveExtraFromItem={cart.removeExtraFromItem}
          onConfirmExtras={(itemName: string) => {
            showPopup(
              "Adicionais confirmados",
              `Adicionais adicionados em ${itemName}`
            );
          }}
          onCheckout={() => {
            if (!storeConfig.lojaAberta) {
              showStoreClosedPopup();
              return;
            }

            if (!minimumReached) {
              showPopup(
                "Pedido mínimo",
                `Faltam ${formatCurrency(missingMinimum)} para finalizar.`,
                "danger"
              );
              return;
            }

            setIsCartOpen(false);
            setShowCheckout(true);
          }}
          minimumOrder={minimumOrder}
          missingMinimum={missingMinimum}
          checkoutDisabled={cart.items.length === 0 || !minimumReached}
          checkoutDisabledMessage={
            cart.items.length === 0 ? "Carrinho vazio" : `Faltam ${formatCurrency(missingMinimum)}`
          }
          onAddMore={() => {
            setIsCartOpen(false);
          }}
        />
      )}

      {showCheckout && (
        <div className="cart-overlay is-open">
          <button
            className="cart-backdrop"
            onClick={() => setShowCheckout(false)}
          />

          <div className="checkout-modal">
            <CheckoutSection
              checkout={checkout}
              setCheckout={setCheckout}
              orderDraft={orderDraft}
              storeConfig={storeConfig}
              cartIsEmpty={cart.items.length === 0}
              missingMinimum={missingMinimum}
              onClose={() => setShowCheckout(false)}
              onFinishOrder={(createdOrder) => {
                setFinishedPaymentMethod(checkout.fulfillment === "table" ? null : checkout.paymentMethod);
                setFinishedOrder(createdOrder);
                setPixCopied(false);
                setShowCheckout(false);
                setShowSuccess(true);

                cart.clearCart();
              }}
            />
          </div>
        </div>
      )}

      {pendingFlavorItem && pendingFlavorItem.options && pendingFlavorItem.options.length > 0 && (
        <div className="cart-extras-screen" role="dialog" aria-modal="true" aria-label="Escolher sabor">
          <button
            className="cart-extras-screen-backdrop"
            type="button"
            onClick={() => setPendingFlavorItem(null)}
            aria-label="Fechar sabores"
          />

          <section className="cart-extras-modal cart-flavor-modal">
            <div className="cart-extras-modal-header">
              <div>
                <strong>Escolha o sabor</strong>
                <span>Para: {pendingFlavorItem.name}</span>
              </div>

              <button
                type="button"
                onClick={() => setPendingFlavorItem(null)}
                aria-label="Fechar sabores"
              >
                <X size={18} />
              </button>
            </div>

            <div className="cart-flavor-list">
              {pendingFlavorItem.options.map((flavor) => (
                <button
                  key={flavor}
                  type="button"
                  onClick={() => {
                    addMenuItem(pendingFlavorItem, flavor);
                    setPendingFlavorItem(null);
                  }}
                >
                  <span>{flavor}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-box">
            <div className="success-icon">🎉</div>

            <h1>Pedido realizado!</h1>

            <p>
              Pedido enviado com sucesso! Ele está aguardando aprovação da loja.
            </p>

            {finishedOrder && (
              <div className="success-order-summary">
                {(finishedOrder.numeroPedido ?? finishedOrder.id) && (
                  <div>
                    <span>Pedido</span>
                    <strong>#{finishedOrder.numeroPedido ?? finishedOrder.id}</strong>
                  </div>
                )}
                <div>
                  <span>Cliente</span>
                  <strong>{finishedOrder.nomeCliente || checkout.customerName || "Cliente"}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{formatCurrency(finishedOrder.total ?? orderDraft.total)}</strong>
                </div>
                <div>
                  <span>Status</span>
                  <strong>{orderStatusLabels[finishedOrder.status] ?? finishedOrder.status ?? "Aguardando aprovação"}</strong>
                </div>
                {(finishedOrder.previsaoEntrega || finishedOrder.previsaoRetirada) && (
                  <div>
                    <span>Previsão</span>
                    <strong>{finishedOrder.previsaoEntrega ?? finishedOrder.previsaoRetirada}</strong>
                  </div>
                )}
              </div>
            )}

            {finishedPaymentMethod === "pix" && (
              <div className="success-pix-box">
                <span>Chave PIX</span>
                <strong>{checkoutPixKey}</strong>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(checkoutPixKey).then(() => {
                      setPixCopied(true);
                    });
                  }}
                >
                  {pixCopied ? "Chave copiada" : "Copiar chave PIX"}
                </button>
              </div>
            )}

            <button
              onClick={() => setShowSuccess(false)}
              className="success-button"
            >
              Continuar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

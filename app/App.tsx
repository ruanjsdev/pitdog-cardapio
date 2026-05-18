import { useEffect, useMemo, useState } from "react";

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
import { CheckoutForm } from "../types/order";

const STORAGE_CHECKOUT_KEY = "pits-dog-checkout";
const MIN_LOADING_TIME = 2200;

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
  const [lastOrderNumber, setLastOrderNumber] = useState<number | undefined>();

  const [checkout, setCheckout] = useState<CheckoutForm>(() => loadCheckout());

  useEffect(() => {
    localStorage.setItem(STORAGE_CHECKOUT_KEY, JSON.stringify(checkout));
  }, [checkout]);

  useEffect(() => {
    let isMounted = true;

    const loadApiData = async () => {
      setIsMenuLoading(true);

      const [nextStoreConfig, nextMenu] = await Promise.all([
        getStoreConfig(),
        getPublicMenu(),
      ]);

      if (!isMounted) return;

      setStoreConfig(nextStoreConfig);
      setCategories(nextMenu.categories);
      setProducts(nextMenu.products);
      setIsMenuLoading(false);
    };

    loadApiData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isCartOpen || showCheckout) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isCartOpen, showCheckout]);

  useEffect(() => {
    if (isMenuLoading || cart.items.length === 0) return;

    const availableProductIds = new Set(products.map((item) => item.id));
    const hasUnavailableItem =
      products.length === 0 ||
      cart.items.some((cartItem) => !availableProductIds.has(cartItem.item.id));

    if (hasUnavailableItem) {
      cart.clearCart();
    }
  }, [cart, isMenuLoading, products]);

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

  const visibleCategories = useMemo(
    () => categories.filter((category) => category.id !== "extras"),
    [categories]
  );

  const visibleProducts = useMemo(
    () => products.filter((item) => item.categoryId !== "extras"),
    [products]
  );

  const showPopup = (title: string, message: string) => {
    setAddedPopup({
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

  return (
    <>
      <div className="bg-rain" aria-hidden="true" />

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
          getItemQuantity={(itemId) => {
            const itemInCart = cart.items.find((cartItem: any) => {
              const cartItemId =
                cartItem.id ??
                cartItem.item?.id ??
                cartItem.product?.id ??
                cartItem.menuItem?.id ??
                cartItem.productId;

              return String(cartItemId) === String(itemId);
            });

            return itemInCart?.quantity ?? 0;
          }}
          onAddItem={(item) => {
            if (!storeConfig.lojaAberta) return;

            cart.addItem(item);
            showAddedItemPopup(item);
          }}
        />

        {addedPopup && (
          <div className="added-item-popup">
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
          onAddItem={(item) => {
            if (!storeConfig.lojaAberta) return;

            cart.addItem(item);
            showAddedItemPopup(item);
          }}
          onDecreaseItem={cart.decreaseItem}
          onRemoveItem={cart.removeItem}
          onAddExtraToItem={(parentItemId: string, extraItem: MenuItem) => {
            if (!storeConfig.lojaAberta) return;

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
            if (!storeConfig.lojaAberta) return;

            setIsCartOpen(false);
            setShowCheckout(true);
          }}
          checkoutDisabled={!storeConfig.lojaAberta || cart.items.length === 0}
          checkoutDisabledMessage={
            !storeConfig.lojaAberta ? "Loja fechada" : "Carrinho vazio"
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
              onClose={() => setShowCheckout(false)}
              onFinishOrder={(order) => {
                setLastOrderNumber(order.numeroPedido);
                setShowCheckout(false);
                setShowSuccess(true);

                cart.clearCart();
              }}
            />
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="success-overlay">
          <div className="success-box">
            <div className="success-icon">🎉</div>

            <h1>Pedido realizado!</h1>

            <p>
              {lastOrderNumber
                ? `Pedido #${lastOrderNumber} enviado para o painel admin.`
                : "Pedido enviado para o painel admin."}
            </p>

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

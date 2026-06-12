import { useMemo, useState } from "react";
import { MenuItem } from "../types/menu";
import { CartItem } from "../types/order";
import { DELIVERY_FEE, getCartCount } from "../utils/order";

const STORAGE_KEY = "pits-dog-cart";

export type CartExtraItem = {
  item: MenuItem;
  quantity: number;
};

export type CartItemWithExtras = CartItem & {
  extras?: CartExtraItem[];
};

const readInitialCart = (): CartItemWithExtras[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useCart = () => {
  const [items, setItems] = useState<CartItemWithExtras[]>(readInitialCart);

  const syncCart = (nextItems: CartItemWithExtras[]) => {
    setItems(nextItems);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  };

  const getCartItemKey = (cartItem: CartItemWithExtras) => cartItem.cartId ?? cartItem.item.id;

  const addItem = (item: MenuItem, notes = "") => {
    const normalizedNotes = notes.trim();
    const existing = items.find((cartItem) =>
      cartItem.item.id === item.id && (cartItem.notes ?? "") === normalizedNotes
    );

    if (existing) {
      syncCart(
        items.map((cartItem) =>
          getCartItemKey(cartItem) === getCartItemKey(existing)
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
      return;
    }

    syncCart([
      ...items,
      {
        cartId: `${item.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        item,
        notes: normalizedNotes,
        quantity: 1,
        extras: [],
      },
    ]);
  };

  const decreaseItem = (itemId: string) => {
    syncCart(
      items
        .map((cartItem) =>
          getCartItemKey(cartItem) === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    syncCart(items.filter((cartItem) => getCartItemKey(cartItem) !== itemId));
  };

  const updateItemNotes = (itemId: string, notes: string) => {
    syncCart(
      items.map((cartItem) =>
        getCartItemKey(cartItem) === itemId
          ? { ...cartItem, notes }
          : cartItem
      )
    );
  };

  const addExtraToItem = (parentItemId: string, extraItem: MenuItem) => {
    syncCart(
      items.map((cartItem) => {
        if (getCartItemKey(cartItem) !== parentItemId) return cartItem;

        const currentExtras = cartItem.extras ?? [];

        const existingExtra = currentExtras.find(
          (extra) => extra.item.id === extraItem.id
        );

        if (existingExtra) {
          return {
            ...cartItem,
            extras: currentExtras.map((extra) =>
              extra.item.id === extraItem.id
                ? { ...extra, quantity: extra.quantity + 1 }
                : extra
            ),
          };
        }

        return {
          ...cartItem,
          extras: [
            ...currentExtras,
            {
              item: extraItem,
              quantity: 1,
            },
          ],
        };
      })
    );
  };

  const decreaseExtraFromItem = (parentItemId: string, extraItemId: string) => {
    syncCart(
      items.map((cartItem) => {
        if (getCartItemKey(cartItem) !== parentItemId) return cartItem;

        const currentExtras = cartItem.extras ?? [];

        return {
          ...cartItem,
          extras: currentExtras
            .map((extra) =>
              extra.item.id === extraItemId
                ? { ...extra, quantity: extra.quantity - 1 }
                : extra
            )
            .filter((extra) => extra.quantity > 0),
        };
      })
    );
  };

  const removeExtraFromItem = (parentItemId: string, extraItemId: string) => {
    syncCart(
      items.map((cartItem) => {
        if (getCartItemKey(cartItem) !== parentItemId) return cartItem;

        return {
          ...cartItem,
          extras: (cartItem.extras ?? []).filter(
            (extra) => extra.item.id !== extraItemId
          ),
        };
      })
    );
  };

  const clearCart = () => syncCart([]);

  const summary = useMemo(() => {
    const subtotal = items.reduce((total, cartItem) => {
      const itemTotal = cartItem.item.price * cartItem.quantity;

      const extrasTotal = (cartItem.extras ?? []).reduce(
        (extraTotal, extra) => extraTotal + extra.item.price * extra.quantity,
        0
      );

      return total + itemTotal + extrasTotal;
    }, 0);

    const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;

    return {
      count: getCartCount(items),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    };
  }, [items]);

  return {
    items,
    summary,
    addItem,
    decreaseItem,
    removeItem,
    updateItemNotes,
    addExtraToItem,
    decreaseExtraFromItem,
    removeExtraFromItem,
    clearCart,
  };
};

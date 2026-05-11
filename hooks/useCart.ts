import { useMemo, useState } from "react";
import { MenuItem } from "../types/menu";
import { CartItem } from "../types/order";
import { DELIVERY_FEE, getCartCount, getSubtotal } from "../utils/order";

const STORAGE_KEY = "pits-dog-cart";

const readInitialCart = (): CartItem[] => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>(readInitialCart);

  const syncCart = (nextItems: CartItem[]) => {
    setItems(nextItems);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  };

  const addItem = (item: MenuItem) => {
    const existing = items.find((cartItem) => cartItem.item.id === item.id);

    if (existing) {
      syncCart(
        items.map((cartItem) =>
          cartItem.item.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        )
      );
      return;
    }

    syncCart([...items, { item, quantity: 1 }]);
  };

  const decreaseItem = (itemId: string) => {
    syncCart(
      items
        .map((cartItem) =>
          cartItem.item.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem
        )
        .filter((cartItem) => cartItem.quantity > 0)
    );
  };

  const removeItem = (itemId: string) => {
    syncCart(items.filter((cartItem) => cartItem.item.id !== itemId));
  };

  const clearCart = () => syncCart([]);

  const summary = useMemo(() => {
    const subtotal = getSubtotal(items);
    const deliveryFee = items.length > 0 ? DELIVERY_FEE : 0;

    return {
      count: getCartCount(items),
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    };
  }, [items]);

  return {
    items,
    summary,
    addItem,
    decreaseItem,
    removeItem,
    clearCart
  };
};

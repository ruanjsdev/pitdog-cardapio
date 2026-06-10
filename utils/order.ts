import { CartItem } from "../types/order";

export const DELIVERY_FEE = 5;

export const getCartCount = (items: CartItem[]) =>
  items.reduce((total, cartItem) => total + cartItem.quantity, 0);

export const getSubtotal = (items: CartItem[]) =>
  items.reduce((total, cartItem) => {
    const itemTotal = cartItem.item.price * cartItem.quantity;

    const extrasTotal = (cartItem.extras ?? []).reduce(
      (extraTotal, extra) => extraTotal + extra.item.price * extra.quantity,
      0
    );

    return total + itemTotal + extrasTotal;
  }, 0);
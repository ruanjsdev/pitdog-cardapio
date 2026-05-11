import { CartItem } from "../types/order";

export const DELIVERY_FEE = 5;

export const getCartCount = (items: CartItem[]) =>
  items.reduce((total, cartItem) => total + cartItem.quantity, 0);

export const getSubtotal = (items: CartItem[]) =>
  items.reduce((total, cartItem) => total + cartItem.item.price * cartItem.quantity, 0);

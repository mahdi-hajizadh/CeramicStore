import { useContext } from "react";
import { CartContext } from "./CartContext.js";

export function useCart() {
  const value = useContext(CartContext);

  if (!value) {
    throw new Error("useCart باید داخل CartProvider استفاده شود.");
  }

  return value;
}

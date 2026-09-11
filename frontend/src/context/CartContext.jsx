import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { cartItemCount, cartReducer, cartSubtotal } from "./cartReducer.js";

const STORAGE_KEY = "mark-fruit:cart:v1";
const CartContext = createContext(null);

function loadStoredCart() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return cartReducer([], { type: "HYDRATE", items: stored });
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, loadStoredCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    dispatch({ type: "ADD", product, quantity });
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    dispatch({ type: "SET_QUANTITY", id, quantity });
  }, []);

  const removeItem = useCallback((id) => {
    dispatch({ type: "REMOVE", id });
  }, []);

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const value = useMemo(
    () => ({
      items,
      itemCount: cartItemCount(items),
      subtotal: cartSubtotal(items),
      addItem,
      setQuantity,
      removeItem,
      clearCart,
    }),
    [items, addItem, setQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart deve ser usado dentro de CartProvider");
  return context;
}

import { act, renderHook } from "@testing-library/react";
import { beforeEach, expect, it } from "vitest";
import { CartProvider, useCart } from "./CartContext.jsx";

const product = {
  id: 11,
  title: "Banana prata",
  price: 6,
  stock: 10,
  authorId: "producer-2",
};

beforeEach(() => localStorage.clear());

it("persiste itens e totais sem guardar dados de autenticação", () => {
  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;
  const { result } = renderHook(() => useCart(), { wrapper });

  act(() => result.current.addItem(product, 2));

  expect(result.current.itemCount).toBe(2);
  expect(result.current.subtotal).toBe(12);
  expect(JSON.parse(localStorage.getItem("mark-fruit:cart:v1"))).toEqual([
    { ...product, quantity: 2 },
  ]);
});

it("recupera um carrinho persistido ao iniciar", () => {
  localStorage.setItem(
    "mark-fruit:cart:v1",
    JSON.stringify([{ ...product, quantity: 3 }])
  );
  const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

  const { result } = renderHook(() => useCart(), { wrapper });

  expect(result.current.itemCount).toBe(3);
  expect(result.current.items[0].title).toBe("Banana prata");
});

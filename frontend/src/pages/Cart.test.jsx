import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, expect, it } from "vitest";
import { CartProvider } from "../context/CartContext.jsx";
import Cart from "./Cart.jsx";

const item = {
  id: 1,
  title: "Tomate orgânico 1kg",
  price: 8.5,
  image: "/products/tomate.png",
  stock: 10,
  authorId: "producer-1",
  author: { id: "producer-1", name: "Fazenda Vale Verde" },
  quantity: 2,
};

function renderCart() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <Cart />
      </CartProvider>
    </MemoryRouter>
  );
}

beforeEach(() => localStorage.clear());

it("orienta a explorar produtos quando o carrinho está vazio", () => {
  renderCart();

  expect(screen.getByRole("heading", { name: "Seu carrinho está vazio" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Explorar produtos" })).toHaveAttribute("href", "/");
});

it("atualiza quantidade, total e remoção do produto", () => {
  localStorage.setItem("mark-fruit:cart:v1", JSON.stringify([item]));
  renderCart();

  const totalRow = screen.getByText("Total").parentElement;
  expect(within(totalRow).getByText("R$ 17,00")).toBeVisible();
  fireEvent.click(screen.getByRole("button", { name: "Aumentar quantidade de Tomate orgânico 1kg" }));
  expect(within(totalRow).getByText("R$ 25,50")).toBeVisible();

  fireEvent.click(screen.getByRole("button", { name: "Remover Tomate orgânico 1kg" }));
  expect(screen.getByRole("heading", { name: "Seu carrinho está vazio" })).toBeVisible();
});

it("oferece checkout quando há itens", () => {
  localStorage.setItem("mark-fruit:cart:v1", JSON.stringify([item]));
  renderCart();

  expect(screen.getByRole("link", { name: "Continuar para o checkout" })).toHaveAttribute(
    "href",
    "/checkout"
  );
});

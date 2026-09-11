import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import { CartProvider } from "../context/CartContext.jsx";
import Checkout from "./Checkout.jsx";

const createCheckout = vi.fn();
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

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({
    user: { id: "buyer", name: "Ana", city: "Campinas", state: "SP" },
  }),
}));

vi.mock("../services/orders.js", () => ({ createCheckout: (...args) => createCheckout(...args) }));

function renderCheckout() {
  localStorage.setItem("mark-fruit:cart:v1", JSON.stringify([item]));
  return render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <CartProvider>
        <Routes>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/pedido-confirmado" element={<h1>Pedido confirmado</h1>} />
        </Routes>
      </CartProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  localStorage.clear();
  createCheckout.mockReset();
});

it("identifica claramente que o pagamento é uma simulação acadêmica", () => {
  renderCheckout();
  expect(screen.getByText(/pagamento simulado para fins acadêmicos/i)).toBeVisible();
});

it("exige endereço completo somente para entrega", async () => {
  renderCheckout();
  fireEvent.click(screen.getByRole("radio", { name: /^Entrega/ }));
  fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido simulado" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Preencha o endereço completo");
  expect(createCheckout).not.toHaveBeenCalled();
});

it("mantém o carrinho quando o Supabase recusa o checkout", async () => {
  createCheckout.mockRejectedValue(new Error("O estoque mudou."));
  renderCheckout();

  fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido simulado" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("O estoque mudou");
  expect(JSON.parse(localStorage.getItem("mark-fruit:cart:v1"))).toHaveLength(1);
});

it("limpa o carrinho e abre a confirmação após sucesso", async () => {
  createCheckout.mockResolvedValue([21]);
  renderCheckout();

  fireEvent.click(screen.getByRole("button", { name: "Confirmar pedido simulado" }));

  expect(await screen.findByRole("heading", { name: "Pedido confirmado" })).toBeVisible();
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem("mark-fruit:cart:v1"))).toEqual([]);
  });
});

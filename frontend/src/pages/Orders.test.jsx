import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Orders from "./Orders.jsx";

const listBuyerOrders = vi.fn();
vi.mock("../services/orders.js", () => ({ listBuyerOrders: (...args) => listBuyerOrders(...args) }));
vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => ({ user: { id: "buyer-1", name: "Maria" } }) }));

const order = {
  id: 42,
  status: "PREPARING",
  fulfillmentMethod: "PICKUP",
  total: 19.5,
  createdAt: "2026-09-11T12:00:00Z",
  producer: { name: "Sítio Boa Terra", city: "Arpovo", state: "PR" },
  items: [{ id: 1, title: "Cesta de frutas da estação", quantity: 1, subtotal: 19.5 }],
};

describe("Orders", () => {
  beforeEach(() => listBuyerOrders.mockReset());

  it("lista os pedidos do consumidor com status e produtor", async () => {
    listBuyerOrders.mockResolvedValue([order]);
    render(<MemoryRouter><Orders /></MemoryRouter>);

    expect(await screen.findByText("Sítio Boa Terra")).toBeInTheDocument();
    expect(screen.getByText("Em preparação")).toBeInTheDocument();
    expect(screen.getByText(/Cesta de frutas da estação/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver detalhes/i })).toHaveAttribute("href", "/pedidos/42");
  });

  it("mostra um estado vazio útil", async () => {
    listBuyerOrders.mockResolvedValue([]);
    render(<MemoryRouter><Orders /></MemoryRouter>);

    expect(await screen.findByRole("heading", { name: /nenhum pedido ainda/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /explorar produtos/i })).toHaveAttribute("href", "/");
  });

});

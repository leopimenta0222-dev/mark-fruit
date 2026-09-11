import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ReceivedOrders from "./ReceivedOrders.jsx";

const listProducerOrders = vi.fn();
const advanceOrderStatus = vi.fn();
vi.mock("../services/orders.js", () => ({
  listProducerOrders: (...args) => listProducerOrders(...args),
  advanceOrderStatus: (...args) => advanceOrderStatus(...args),
}));
vi.mock("../context/AuthContext.jsx", () => ({ useAuth: () => ({ user: { id: "producer-1" } }) }));

const receivedOrder = {
  id: 77,
  status: "RECEIVED",
  fulfillmentMethod: "DELIVERY",
  total: 32,
  createdAt: "2026-09-11T12:00:00Z",
  buyer: { name: "Maria Ferreira", city: "Arpovo", state: "PR" },
  items: [{ id: 1, title: "Laranjas", quantity: 4, subtotal: 32 }],
};

describe("ReceivedOrders", () => {
  beforeEach(() => {
    listProducerOrders.mockReset();
    advanceOrderStatus.mockReset();
  });

  it("lista vendas e permite avançar o andamento", async () => {
    listProducerOrders.mockResolvedValue([receivedOrder]);
    advanceOrderStatus.mockResolvedValue({ ...receivedOrder, status: "PREPARING" });
    render(<MemoryRouter><ReceivedOrders /></MemoryRouter>);

    expect(await screen.findByText("Maria Ferreira")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /marcar como em preparação/i }));

    expect(advanceOrderStatus).toHaveBeenCalledWith(77);
    expect(await screen.findByText("Em preparação")).toBeInTheDocument();
  });

  it("explica o painel quando ainda não há vendas", async () => {
    listProducerOrders.mockResolvedValue([]);
    render(<MemoryRouter><ReceivedOrders /></MemoryRouter>);

    expect(await screen.findByRole("heading", { name: /nenhum pedido recebido/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /criar anúncio/i })).toHaveAttribute("href", "/posts/novo");
  });
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OrderDetail from "./OrderDetail.jsx";

const getOrder = vi.fn();
vi.mock("../services/orders.js", () => ({
  getOrder: (...args) => getOrder(...args),
  advanceOrderStatus: vi.fn(),
}));
vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: { id: "buyer-1", role: "CONSUMER" } }),
}));

const order = {
  id: 42,
  buyerId: "buyer-1",
  status: "READY_OR_SHIPPED",
  fulfillmentMethod: "DELIVERY",
  deliveryAddress: { street: "Rua das Flores", number: "120", complement: "Casa", city: "Arpovo", state: "PR" },
  total: 24,
  paymentMethod: "SIMULATED_PIX",
  createdAt: "2026-09-11T12:00:00Z",
  producer: { name: "Sítio Boa Terra", phone: "(42) 99999-0000", city: "Arpovo", state: "PR" },
  buyer: { name: "Maria Ferreira" },
  items: [{ id: 1, title: "Morangos", quantity: 2, unitPrice: 12, subtotal: 24 }],
};

describe("OrderDetail", () => {
  beforeEach(() => getOrder.mockReset());

  it("mostra andamento, itens, entrega e contato do produtor", async () => {
    getOrder.mockResolvedValue(order);
    render(
      <MemoryRouter initialEntries={["/pedidos/42"]}>
        <Routes><Route path="/pedidos/:id" element={<OrderDetail />} /></Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /pedido #42/i })).toBeInTheDocument();
    expect(screen.getByText("Pronto ou enviado")).toBeInTheDocument();
    expect(screen.getByText("Morangos")).toBeInTheDocument();
    expect(screen.getByText(/Rua das Flores, 120/)).toBeInTheDocument();
    expect(screen.getByText("Sítio Boa Terra")).toBeInTheDocument();
    expect(screen.getByText(/nenhum valor foi cobrado/i)).toBeInTheDocument();
  });

  it("exibe uma saída segura quando o pedido não carrega", async () => {
    getOrder.mockResolvedValue(null);
    render(
      <MemoryRouter initialEntries={["/pedidos/999"]}>
        <Routes><Route path="/pedidos/:id" element={<OrderDetail />} /></Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole("heading", { name: /pedido indisponível/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /voltar aos pedidos/i })).toHaveAttribute("href", "/pedidos");
  });
});

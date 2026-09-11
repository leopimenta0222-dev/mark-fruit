import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import OrderConfirmation from "./OrderConfirmation.jsx";

function renderConfirmation(state) {
  return render(
    <MemoryRouter initialEntries={[{ pathname: "/pedido-confirmado", state }]}>
      <Routes>
        <Route path="/pedido-confirmado" element={<OrderConfirmation />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("OrderConfirmation", () => {
  it("confirma os pedidos criados e explica que o pagamento foi simulado", () => {
    renderConfirmation({ orderIds: [21, 22] });

    expect(screen.getByRole("heading", { name: /pedido confirmado/i })).toBeInTheDocument();
    expect(screen.getByText(/2 pedidos foram criados/i)).toBeInTheDocument();
    expect(screen.getByText(/nenhum valor foi cobrado/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /acompanhar pedidos/i })).toHaveAttribute("href", "/pedidos");
  });

  it("oferece um caminho seguro quando a confirmação é aberta sem dados", () => {
    renderConfirmation(undefined);

    expect(screen.getByRole("heading", { name: /acompanhe seus pedidos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver meus pedidos/i })).toHaveAttribute("href", "/pedidos");
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Navbar from "./Navbar.jsx";

let currentUser;

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: currentUser, logout: vi.fn() }),
}));

vi.mock("../context/ThemeContext.jsx", () => ({
  useTheme: () => ({ dark: false, toggle: vi.fn() }),
}));

vi.mock("../context/CartContext.jsx", () => ({
  useCart: () => ({ itemCount: 2 }),
}));

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

beforeEach(() => {
  currentUser = { id: "buyer", name: "Ana", role: "CONSUMER" };
});

describe("Navbar", () => {
  it("mantém o carrinho acessível com a contagem de itens", () => {
    renderNavbar();

    expect(screen.getByRole("link", { name: "Carrinho com 2 itens" })).toHaveAttribute(
      "href",
      "/carrinho"
    );
  });

  it("mostra o destino de pedidos correspondente ao papel", () => {
    const { unmount } = renderNavbar();
    expect(screen.getAllByRole("link", { name: "Meus pedidos" }).length).toBeGreaterThan(0);
    unmount();

    currentUser = { id: "producer", name: "Joaquim", role: "PRODUCER" };
    renderNavbar();
    expect(screen.getAllByRole("link", { name: "Pedidos recebidos" }).length).toBeGreaterThan(0);
  });

  it("abre o menu da conta com toque ou clique", () => {
    renderNavbar();

    const accountButton = screen.getByRole("button", { name: "Abrir menu da conta" });
    expect(accountButton).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(accountButton);

    expect(accountButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("link", { name: "Meu perfil" })).toBeVisible();
  });
});

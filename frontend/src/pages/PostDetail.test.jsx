import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, expect, it, vi } from "vitest";
import PostDetail from "./PostDetail.jsx";

const addItem = vi.fn();

vi.mock("../context/AuthContext.jsx", () => ({
  useAuth: () => ({ user: { id: "buyer", name: "Ana", role: "CONSUMER" } }),
}));

vi.mock("../context/CartContext.jsx", () => ({
  useCart: () => ({ addItem }),
}));

vi.mock("../services/db.js", () => ({
  getPost: async () => ({
    id: 1,
    title: "Tomate orgânico 1kg",
    description: "Colhido no dia.",
    price: 8.5,
    image: "/products/tomate.png",
    category: "Verduras",
    stock: 5,
    authorId: "producer",
    author: { id: "producer", name: "Fazenda Vale Verde", city: "Campinas", state: "SP" },
    averageRating: 0,
    ratingCount: 0,
    ratings: [],
  }),
  ratePost: vi.fn(),
  deleteRating: vi.fn(),
  deletePost: vi.fn(),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/post/1"]}>
      <Routes>
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/checkout" element={<h1>Checkout aberto</h1>} />
      </Routes>
    </MemoryRouter>
  );
}

beforeEach(() => addItem.mockClear());

it("adiciona a quantidade escolhida ao carrinho e confirma a ação", async () => {
  renderPage();
  await screen.findByRole("heading", { name: "Tomate orgânico 1kg" });

  fireEvent.click(screen.getByRole("button", { name: "Adicionar ao carrinho" }));

  expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 1);
  expect(screen.getByRole("status")).toHaveTextContent("Produto adicionado ao carrinho");
});

it("adiciona o produto e abre o checkout ao comprar agora", async () => {
  renderPage();
  await screen.findByRole("heading", { name: "Tomate orgânico 1kg" });

  fireEvent.click(screen.getByRole("button", { name: "Comprar agora" }));

  expect(addItem).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }), 1);
  expect(screen.getByRole("heading", { name: "Checkout aberto" })).toBeVisible();
});

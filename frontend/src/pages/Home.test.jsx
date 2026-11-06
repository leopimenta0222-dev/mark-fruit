import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import Home from "./Home.jsx";
import { listPosts } from "../services/db.js";

vi.mock("../services/db.js", () => ({
  listPosts: vi.fn().mockResolvedValue([]),
}));

it("apresenta o marketplace sem promessas comerciais não comprovadas", () => {
  render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );

  expect(screen.getByRole("heading", { name: /produtos locais/i })).toBeVisible();
  expect(screen.queryByText(/sem agrotóxico/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/compra protegida/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/frete grátis/i)).not.toBeInTheDocument();
});

it("avisa quando a busca falha", async () => {
  await listPosts.withImplementation(async () => { throw new Error("Falha de rede"); }, async () => {
    render(
      <MemoryRouter initialEntries={["/?q=morango"]}>
        <Home />
      </MemoryRouter>
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(/não foi possível carregar os produtos/i);
    expect(screen.queryByText(/nada encontrado/i)).not.toBeInTheDocument();
  });
});

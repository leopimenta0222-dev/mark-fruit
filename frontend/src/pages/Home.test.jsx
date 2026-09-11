import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it, vi } from "vitest";
import Home from "./Home.jsx";

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

import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import NotFound from "./NotFound.jsx";

it("oferece caminhos úteis quando a página não existe", () => {
  render(<MemoryRouter><NotFound /></MemoryRouter>);

  expect(screen.getByRole("heading", { name: /essa página não brotou/i })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /voltar ao início/i })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: /aprender a plantar/i })).toHaveAttribute("href", "/como-plantar");
});

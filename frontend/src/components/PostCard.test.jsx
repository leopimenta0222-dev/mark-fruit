import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { expect, it } from "vitest";
import PostCard from "./PostCard.jsx";

it("mostra somente informações comerciais existentes no anúncio", () => {
  render(
    <MemoryRouter>
      <PostCard post={{
        id: 3,
        title: "Maçã gala 1kg",
        price: 30,
        image: "/products/maca.png",
        isSeed: false,
        averageRating: 4,
        ratingCount: 2,
        author: { name: "Fazenda Vale Verde" },
        distanceKm: 5,
      }} />
    </MemoryRouter>
  );

  expect(screen.getByText("R$ 30,00")).toBeVisible();
  expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  expect(screen.queryByText(/sem juros/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/frete grátis/i)).not.toBeInTheDocument();
});

import { describe, expect, it } from "vitest";
import { cartItemCount, cartReducer, cartSubtotal } from "./cartReducer.js";

const tomato = {
  id: 7,
  title: "Tomate italiano",
  price: 8.5,
  stock: 3,
  authorId: "producer-1",
};

describe("cartReducer", () => {
  it("soma quantidades do mesmo produto sem ultrapassar o estoque", () => {
    const once = cartReducer([], { type: "ADD", product: tomato, quantity: 2 });
    const twice = cartReducer(once, { type: "ADD", product: tomato, quantity: 2 });

    expect(twice).toEqual([{ ...tomato, quantity: 3 }]);
  });

  it("remove o produto quando a quantidade chega a zero", () => {
    const state = [{ ...tomato, quantity: 1 }];

    expect(cartReducer(state, { type: "SET_QUANTITY", id: 7, quantity: 0 })).toEqual([]);
  });

  it("remove somente o produto informado", () => {
    const lettuce = { ...tomato, id: 8, title: "Alface" };
    const state = [{ ...tomato, quantity: 1 }, { ...lettuce, quantity: 1 }];

    expect(cartReducer(state, { type: "REMOVE", id: 7 })).toEqual([
      { ...lettuce, quantity: 1 },
    ]);
  });

  it("descarta um estado persistido malformado", () => {
    expect(cartReducer([], { type: "HYDRATE", items: { id: 7 } })).toEqual([]);
  });
});

describe("cart totals", () => {
  it("calcula contagem e subtotal a partir das quantidades", () => {
    const items = [
      { ...tomato, quantity: 2 },
      { ...tomato, id: 8, price: 4, quantity: 3 },
    ];

    expect(cartItemCount(items)).toBe(5);
    expect(cartSubtotal(items)).toBe(29);
  });
});

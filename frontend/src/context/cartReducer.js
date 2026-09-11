function sameId(left, right) {
  return String(left) === String(right);
}

function clampQuantity(quantity, stock) {
  const parsed = Number(quantity);
  const available = Math.max(0, Number(stock) || 0);
  if (!Number.isFinite(parsed)) return 0;
  return Math.min(Math.max(0, Math.trunc(parsed)), available);
}

function isValidItem(item) {
  return Boolean(
    item &&
    typeof item === "object" &&
    item.id != null &&
    typeof item.title === "string" &&
    Number.isFinite(Number(item.price)) &&
    Number(item.price) >= 0 &&
    Number(item.stock) > 0 &&
    Number(item.quantity) > 0
  );
}

export function cartReducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      if (!Array.isArray(action.items)) return [];
      return action.items
        .filter(isValidItem)
        .map((item) => ({
          ...item,
          price: Number(item.price),
          stock: Number(item.stock),
          quantity: clampQuantity(item.quantity, item.stock),
        }));

    case "ADD": {
      const requested = clampQuantity(action.quantity, action.product.stock);
      if (requested === 0) return state;
      const existing = state.find((item) => sameId(item.id, action.product.id));
      if (!existing) return [...state, { ...action.product, quantity: requested }];

      return state.map((item) =>
        sameId(item.id, action.product.id)
          ? {
              ...item,
              ...action.product,
              quantity: clampQuantity(item.quantity + requested, action.product.stock),
            }
          : item
      );
    }

    case "SET_QUANTITY": {
      const existing = state.find((item) => sameId(item.id, action.id));
      if (!existing) return state;
      const quantity = clampQuantity(action.quantity, existing.stock);
      if (quantity === 0) return state.filter((item) => !sameId(item.id, action.id));
      return state.map((item) =>
        sameId(item.id, action.id) ? { ...item, quantity } : item
      );
    }

    case "REMOVE":
      return state.filter((item) => !sameId(item.id, action.id));

    case "CLEAR":
      return [];

    default:
      return state;
  }
}

export function cartItemCount(items) {
  return items.reduce((total, item) => total + Number(item.quantity), 0);
}

export function cartSubtotal(items) {
  return items.reduce(
    (total, item) => total + Number(item.price) * Number(item.quantity),
    0
  );
}

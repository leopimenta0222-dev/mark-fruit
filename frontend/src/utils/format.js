export const ORDER_STATUS = {
  RECEIVED: { label: "Pedido recebido", next: "PREPARING" },
  PREPARING: { label: "Em preparação", next: "READY_OR_SHIPPED" },
  READY_OR_SHIPPED: { label: "Pronto ou enviado", next: "COMPLETED" },
  COMPLETED: { label: "Concluído", next: null },
};

export function formatCurrency(value) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function formatDate(value) {
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

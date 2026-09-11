import { describe, expect, it } from "vitest";
import { formatCurrency, formatDate, ORDER_STATUS } from "./format.js";

describe("formatCurrency", () => {
  it("formata valores em reais com duas casas decimais", () => {
    expect(formatCurrency(12.5)).toMatch(/R\$\s12,50/);
  });
});

describe("formatDate", () => {
  it("formata uma data ISO para leitura em português", () => {
    expect(formatDate("2026-09-11T15:30:00-03:00")).toContain("11/09/2026");
  });
});

describe("ORDER_STATUS", () => {
  it("define a sequência completa do pedido", () => {
    expect(ORDER_STATUS.RECEIVED.next).toBe("PREPARING");
    expect(ORDER_STATUS.PREPARING.next).toBe("READY_OR_SHIPPED");
    expect(ORDER_STATUS.READY_OR_SHIPPED.next).toBe("COMPLETED");
    expect(ORDER_STATUS.COMPLETED.next).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { makeOrdersService, mapOrder } from "./orders.js";

describe("createCheckout", () => {
  it("envia ao banco somente o identificador e a quantidade dos produtos", async () => {
    const calls = [];
    const client = {
      rpc: async (name, payload) => {
        calls.push({ name, payload });
        return { data: { orderIds: [12, 13] }, error: null };
      },
    };
    const service = makeOrdersService(client);

    const ids = await service.createCheckout({
      items: [{ id: 9, title: "Não enviar", price: 999, quantity: 2 }],
      fulfillmentMethod: "PICKUP",
      address: {},
      paymentMethod: "SIMULATED_PIX",
      submissionToken: "00000000-0000-4000-8000-000000000001",
    });

    expect(ids).toEqual([12, 13]);
    expect(calls).toEqual([{
      name: "create_checkout",
      payload: {
        checkout_items: [{ post_id: 9, quantity: 2 }],
        fulfillment_method: "PICKUP",
        delivery_address: {},
        payment_method: "SIMULATED_PIX",
        submission_token: "00000000-0000-4000-8000-000000000001",
      },
    }]);
  });

  it("traduz erros de estoque para uma orientação acionável", async () => {
    const client = {
      rpc: async () => ({ data: null, error: { message: "INSUFFICIENT_STOCK" } }),
    };
    const service = makeOrdersService(client);

    await expect(service.createCheckout({
      items: [{ id: 1, quantity: 99 }],
      fulfillmentMethod: "PICKUP",
      address: {},
      paymentMethod: "SIMULATED_PIX",
      submissionToken: "00000000-0000-4000-8000-000000000001",
    })).rejects.toThrow("estoque mudou");
  });
});

describe("mapOrder", () => {
  it("normaliza pedido e itens do Supabase para o formato das telas", () => {
    expect(mapOrder({
      id: 4,
      buyer_id: "buyer",
      producer_id: "producer",
      status: "RECEIVED",
      fulfillment_method: "DELIVERY",
      delivery_address: { street: "Rua A" },
      subtotal: "20.50",
      total: "20.50",
      payment_method: "SIMULATED_CARD",
      payment_status: "SIMULATED_APPROVED",
      created_at: "2026-09-11T10:00:00Z",
      updated_at: "2026-09-11T10:00:00Z",
      items: [{ id: 8, unit_price: "10.25", quantity: 2, subtotal: "20.50" }],
    })).toMatchObject({
      id: 4,
      buyerId: "buyer",
      producerId: "producer",
      fulfillmentMethod: "DELIVERY",
      subtotal: 20.5,
      items: [{ id: 8, unitPrice: 10.25, quantity: 2, subtotal: 20.5 }],
    });
  });
});

describe("advanceOrderStatus", () => {
  it("recarrega o pedido completo depois de avançar o status", async () => {
    const rpcCalls = [];
    const fullOrder = {
      id: 5,
      status: "PREPARING",
      subtotal: "17.80",
      total: "17.80",
      delivery_address: {},
      buyer: { name: "Ana Consumidora" },
      items: [{ id: 1, title: "Goiaba vermelha 1kg", quantity: 2, unit_price: "8.90", subtotal: "17.80" }],
    };
    const client = {
      rpc: async (name, payload) => { rpcCalls.push({ name, payload }); return { data: { id: 5, status: "PREPARING" }, error: null }; },
      from: () => ({
        select: () => ({
          eq: () => ({ single: async () => ({ data: fullOrder, error: null }) }),
        }),
      }),
    };

    const updated = await makeOrdersService(client).advanceOrderStatus(5);

    expect(rpcCalls).toEqual([{ name: "advance_order_status", payload: { target_order_id: 5 } }]);
    expect(updated).toMatchObject({
      id: 5,
      status: "PREPARING",
      buyer: { name: "Ana Consumidora" },
      items: [{ title: "Goiaba vermelha 1kg", quantity: 2 }],
    });
  });
});

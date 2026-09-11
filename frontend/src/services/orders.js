import { supabase } from "./supabase.js";

const ORDER_SELECT = `
  *,
  items:order_items(*),
  buyer:profiles!orders_buyer_id_fkey(id,name,phone,city,state,avatar),
  producer:profiles!orders_producer_id_fkey(id,name,phone,city,state,avatar)
`;

function orderError(error) {
  const message = error?.message || "";
  if (message.includes("INSUFFICIENT_STOCK")) {
    return new Error("O estoque mudou. Revise as quantidades do carrinho e tente novamente.");
  }
  if (message.includes("PRODUCT_NOT_FOUND")) {
    return new Error("Um dos produtos não está mais disponível.");
  }
  if (message.includes("OWN_PRODUCT")) {
    return new Error("Você não pode comprar um produto do seu próprio anúncio.");
  }
  if (message.includes("FORBIDDEN")) {
    return new Error("Você não tem permissão para alterar este pedido.");
  }
  if (message.includes("ORDER_ALREADY_COMPLETED")) {
    return new Error("Este pedido já foi concluído.");
  }
  return new Error("Não foi possível concluir a operação. Tente novamente.");
}

export function mapOrder(row) {
  return {
    id: row.id,
    buyerId: row.buyer_id,
    producerId: row.producer_id,
    status: row.status,
    fulfillmentMethod: row.fulfillment_method,
    deliveryAddress: row.delivery_address || {},
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    buyer: row.buyer || null,
    producer: row.producer || null,
    items: (row.items || []).map((item) => ({
      id: item.id,
      orderId: item.order_id,
      postId: item.post_id,
      title: item.title,
      unitPrice: Number(item.unit_price),
      quantity: Number(item.quantity),
      subtotal: Number(item.subtotal),
    })),
  };
}

export function makeOrdersService(client) {
  async function createCheckout({
    items,
    fulfillmentMethod,
    address,
    paymentMethod,
    submissionToken,
  }) {
    const { data, error } = await client.rpc("create_checkout", {
      checkout_items: items.map((item) => ({
        post_id: item.id,
        quantity: item.quantity,
      })),
      fulfillment_method: fulfillmentMethod,
      delivery_address: address || {},
      payment_method: paymentMethod,
      submission_token: submissionToken,
    });
    if (error) throw orderError(error);
    return data?.orderIds || [];
  }

  async function listBuyerOrders(userId) {
    const { data, error } = await client
      .from("orders")
      .select(ORDER_SELECT)
      .eq("buyer_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw orderError(error);
    return (data || []).map(mapOrder);
  }

  async function listProducerOrders(userId) {
    const { data, error } = await client
      .from("orders")
      .select(ORDER_SELECT)
      .eq("producer_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw orderError(error);
    return (data || []).map(mapOrder);
  }

  async function getOrder(id) {
    const { data, error } = await client
      .from("orders")
      .select(ORDER_SELECT)
      .eq("id", id)
      .single();
    if (error) throw orderError(error);
    return mapOrder(data);
  }

  async function advanceOrderStatus(id) {
    const { data, error } = await client.rpc("advance_order_status", {
      target_order_id: id,
    });
    if (error) throw orderError(error);
    return mapOrder(data);
  }

  return {
    createCheckout,
    listBuyerOrders,
    listProducerOrders,
    getOrder,
    advanceOrderStatus,
  };
}

export const {
  createCheckout,
  listBuyerOrders,
  listProducerOrders,
  getOrder,
  advanceOrderStatus,
} = makeOrdersService(supabase);

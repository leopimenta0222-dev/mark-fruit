import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CreditCard, MapPin, Package, Phone, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { advanceOrderStatus, getOrder } from "../services/orders.js";
import OrderStatus from "../components/OrderStatus.jsx";
import { ORDER_STATUS, formatCurrency, formatDate } from "../utils/format.js";

function addressLabel(address = {}) {
  return [
    [address.street, address.number].filter(Boolean).join(", "),
    address.complement,
    [address.city, address.state].filter(Boolean).join(" · "),
  ].filter(Boolean).join(" — ");
}

function nextLabel(order) {
  if (order.status === "RECEIVED") return "Iniciar preparação";
  if (order.status === "PREPARING") return order.fulfillmentMethod === "DELIVERY" ? "Marcar como enviado" : "Marcar como pronto";
  if (order.status === "READY_OR_SHIPPED") return "Concluir pedido";
  return "";
}

export default function OrderDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);
  const producerView = user.role === "PRODUCER";
  const backPath = producerView ? "/pedidos-recebidos" : "/pedidos";

  useEffect(() => {
    let active = true;
    getOrder(id)
      .then((data) => { if (active) setOrder(data); })
      .catch(() => { if (active) setError("Pedido indisponível"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function advance() {
    setUpdating(true);
    setError("");
    try {
      setOrder(await advanceOrderStatus(order.id));
    } catch (caught) {
      setError(caught.message || "Não foi possível atualizar o pedido.");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="min-h-[60vh] grid place-items-center text-stone-500">Carregando pedido...</div>;

  if (!order) {
    return (
      <div className="min-h-[60vh] bg-stone-50 dark:bg-stone-950 px-4 grid place-items-center text-center">
        <div className="card max-w-lg p-8">
          <Package size={38} className="mx-auto text-stone-400" />
          <h1 className="mt-4 text-2xl font-extrabold">Pedido indisponível</h1>
          <p className="mt-2 text-stone-500">Ele pode não existir ou não pertencer à sua conta.</p>
          <Link to={backPath} className="btn-primary mt-6">Voltar aos pedidos</Link>
        </div>
      </div>
    );
  }

  const contact = producerView ? order.buyer : order.producer;

  return (
    <div className="min-h-[65vh] bg-stone-50 dark:bg-stone-950 px-4 py-7 pb-24 md:py-10">
      <div className="mx-auto max-w-5xl">
        <Link to={backPath} className="inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-brand-700"><ArrowLeft size={17} /> Voltar</Link>
        <header className="mt-5 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-700">{producerView ? "Venda" : "Compra"} registrada</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Pedido #{order.id}</h1>
            <p className="mt-1 text-stone-500">Criado em {formatDate(order.createdAt)}</p>
          </div>
          {producerView && nextLabel(order) && <button onClick={advance} disabled={updating} className="btn-primary min-h-12">{updating ? "Atualizando..." : nextLabel(order)}</button>}
        </header>

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{error}</div>}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] items-start">
          <div className="space-y-5">
            <section className="card p-5 md:p-6">
              <h2 className="text-lg font-extrabold">Andamento</h2>
              <div className="mt-5"><OrderStatus status={order.status} /></div>
              <p className="mt-4 text-sm text-stone-500">{ORDER_STATUS[order.status]?.label}. As alterações são salvas no Supabase e aparecem para comprador e produtor.</p>
            </section>

            <section className="card p-5 md:p-6">
              <h2 className="text-lg font-extrabold">Itens do pedido</h2>
              <div className="mt-4 divide-y divide-stone-100 dark:divide-stone-800">
                {order.items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex justify-between gap-4">
                    <div><strong className="block">{item.title}</strong><span className="text-sm text-stone-500">{item.quantity} × {formatCurrency(item.unitPrice)}</span></div>
                    <strong>{formatCurrency(item.subtotal)}</strong>
                  </div>
                ))}
              </div>
              <div className="mt-5 pt-4 border-t-2 border-stone-200 flex items-end justify-between"><span className="font-bold">Total</span><strong className="text-2xl">{formatCurrency(order.total)}</strong></div>
            </section>
          </div>

          <aside className="space-y-4">
            <section className="card p-5">
              <Store size={20} className="text-brand-700" />
              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-stone-500">{producerView ? "Consumidor" : "Produtor"}</p>
              <h2 className="mt-1 text-lg font-extrabold">{contact?.name || "Contato"}</h2>
              {(contact?.city || contact?.state) && <p className="mt-2 text-sm text-stone-500">{[contact.city, contact.state].filter(Boolean).join(" · ")}</p>}
              {contact?.phone && <p className="mt-3 flex items-center gap-2 text-sm font-semibold"><Phone size={16} /> {contact.phone}</p>}
            </section>

            <section className="card p-5">
              <MapPin size={20} className="text-brand-700" />
              <h2 className="mt-3 font-extrabold">{order.fulfillmentMethod === "DELIVERY" ? "Entrega" : "Retirada"}</h2>
              <p className="mt-2 text-sm text-stone-500">{order.fulfillmentMethod === "DELIVERY" ? addressLabel(order.deliveryAddress) : "Local e horário combinados diretamente com o produtor."}</p>
            </section>

            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
              <CreditCard size={20} />
              <h2 className="mt-3 font-extrabold">Pagamento simulado</h2>
              <p className="mt-2 text-sm">{order.paymentMethod === "SIMULATED_CARD" ? "Cartão demonstrativo" : "Pix demonstrativo"}. Nenhum valor foi cobrado.</p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

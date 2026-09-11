import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PackageCheck, RefreshCw, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { advanceOrderStatus, listProducerOrders } from "../services/orders.js";
import OrderStatus from "../components/OrderStatus.jsx";
import { formatCurrency, formatDate } from "../utils/format.js";

function actionLabel(order) {
  if (order.status === "RECEIVED") return "Marcar como em preparação";
  if (order.status === "PREPARING") return order.fulfillmentMethod === "DELIVERY" ? "Marcar como enviado" : "Marcar como pronto";
  if (order.status === "READY_OR_SHIPPED") return "Marcar como concluído";
  return "";
}

export default function ReceivedOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    listProducerOrders(user.id)
      .then(setOrders)
      .catch(() => setError("Não foi possível carregar os pedidos recebidos."))
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  async function advance(order) {
    setUpdating(order.id);
    setError("");
    try {
      const updated = await advanceOrderStatus(order.id);
      setOrders((current) => current.map((item) => item.id === order.id ? updated : item));
    } catch (caught) {
      setError(caught.message || "Não foi possível atualizar o pedido.");
    } finally {
      setUpdating(null);
    }
  }

  const activeCount = orders.filter((order) => order.status !== "COMPLETED").length;

  return (
    <div className="min-h-[65vh] bg-stone-50 dark:bg-stone-950 px-4 py-7 pb-24 md:py-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="text-sm font-bold text-brand-700">Área do produtor</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Pedidos recebidos</h1>
            <p className="mt-1 text-stone-500">Organize o preparo e mantenha o consumidor atualizado.</p>
          </div>
          {!loading && orders.length > 0 && (
            <div className="rounded-2xl bg-brand-900 px-5 py-3 text-white">
              <span className="block text-2xl font-extrabold">{activeCount}</span>
              <span className="text-xs text-brand-100">em andamento</span>
            </div>
          )}
        </header>

        {error && <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-800">{error}</div>}
        {loading && <div className="card p-8 text-center text-stone-500">Carregando pedidos...</div>}

        {!loading && orders.length === 0 && !error && (
          <div className="card p-8 md:p-12 text-center">
            <Store size={42} className="mx-auto text-brand-700" />
            <h2 className="mt-4 text-2xl font-extrabold">Nenhum pedido recebido</h2>
            <p className="mt-2 text-stone-500">Seus próximos pedidos aparecerão aqui assim que um consumidor finalizar a compra.</p>
            <Link to="/posts/novo" className="btn-primary mt-6">Criar anúncio</Link>
          </div>
        )}

        {!loading && orders.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-2">
            {orders.map((order) => (
              <article key={order.id} className="card p-5 md:p-6 flex flex-col">
                <div className="flex justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Pedido #{order.id}</p>
                    <h2 className="mt-1 text-xl font-extrabold">{order.buyer?.name || "Consumidor"}</h2>
                    <p className="mt-1 text-sm text-stone-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <OrderStatus status={order.status} compact />
                </div>
                <div className="my-5 flex-1 rounded-xl bg-stone-50 dark:bg-stone-950 p-4">
                  {order.items.map((item) => <p key={item.id} className="text-sm"><strong>{item.quantity}×</strong> {item.title}</p>)}
                  <p className="mt-3 border-t border-stone-200 pt-3 text-right font-extrabold">{formatCurrency(order.total)}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  {actionLabel(order) && (
                    <button disabled={updating === order.id} onClick={() => advance(order)} className="btn-primary flex-1 min-h-11">
                      <PackageCheck size={17} /> {updating === order.id ? "Atualizando..." : actionLabel(order)}
                    </button>
                  )}
                  <Link to={`/pedidos-recebidos/${order.id}`} className="btn-secondary min-h-11">Detalhes <ArrowRight size={17} /></Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

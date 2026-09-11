import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, ShoppingBasket } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { listBuyerOrders } from "../services/orders.js";
import OrderCard from "../components/OrderCard.jsx";

export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError("");
    listBuyerOrders(user.id)
      .then(setOrders)
      .catch(() => setError("Não foi possível carregar seus pedidos agora."))
      .finally(() => setLoading(false));
  }, [user.id]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="min-h-[65vh] bg-stone-50 dark:bg-stone-950 px-4 py-7 pb-24 md:py-10">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-brand-700">Sua feira</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Meus pedidos</h1>
            <p className="mt-1 text-stone-500">Acompanhe cada compra feita pelo Mark Fruit.</p>
          </div>
          {!loading && orders.length > 0 && <span className="hidden sm:block text-sm font-semibold text-stone-500">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"}</span>}
        </header>

        {loading && <div className="card p-8 text-center text-stone-500">Carregando pedidos...</div>}

        {!loading && error && (
          <div role="alert" className="card p-7 text-center">
            <RefreshCw className="mx-auto text-red-600" />
            <p className="mt-3 font-semibold text-red-800">{error}</p>
            <button onClick={load} className="btn-secondary mt-5">Tentar novamente</button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="card p-8 md:p-12 text-center">
            <ShoppingBasket size={40} className="mx-auto text-brand-700" />
            <h2 className="mt-4 text-2xl font-extrabold">Nenhum pedido ainda</h2>
            <p className="mt-2 text-stone-500">Quando você comprar de um produtor local, o pedido aparecerá aqui.</p>
            <Link to="/" className="btn-primary mt-6">Explorar produtos</Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4" aria-label="Lista de pedidos">
            {orders.map((order) => <OrderCard key={order.id} order={order} />)}
          </div>
        )}
      </div>
    </div>
  );
}

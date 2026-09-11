import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Package } from "lucide-react";
import OrderStatus from "./OrderStatus.jsx";
import { formatCurrency, formatDate } from "../utils/format.js";

export default function OrderCard({ order, perspective = "buyer" }) {
  const person = perspective === "producer" ? order.buyer : order.producer;
  const destination = perspective === "producer" ? `/pedidos-recebidos/${order.id}` : `/pedidos/${order.id}`;

  return (
    <article className="card p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Pedido #{order.id}</p>
          <h2 className="mt-1 text-xl font-extrabold text-stone-900 dark:text-stone-100">{person?.name || "Participante do pedido"}</h2>
          {(person?.city || person?.state) && (
            <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500"><MapPin size={15} /> {[person.city, person.state].filter(Boolean).join(" · ")}</p>
          )}
        </div>
        <OrderStatus status={order.status} compact />
      </div>

      <div className="mt-5 border-y border-stone-100 dark:border-stone-800 py-4 space-y-2">
        {order.items.slice(0, 2).map((item) => (
          <div key={item.id} className="flex justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-stone-700 dark:text-stone-300"><Package size={15} className="text-brand-700" /> {item.quantity}× {item.title}</span>
            <strong>{formatCurrency(item.subtotal)}</strong>
          </div>
        ))}
        {order.items.length > 2 && <p className="text-xs text-stone-500">+ {order.items.length - 2} outro(s) item(ns)</p>}
      </div>

      <div className="mt-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-stone-500">{formatDate(order.createdAt)}</p>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">Total <strong className="ml-1 text-lg text-stone-900 dark:text-stone-100">{formatCurrency(order.total)}</strong></p>
        </div>
        <Link to={destination} className="btn-secondary min-h-11">Ver detalhes <ArrowRight size={17} /></Link>
      </div>
    </article>
  );
}

import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Check, ClipboardList, Leaf } from "lucide-react";

export default function OrderConfirmation() {
  const { state } = useLocation();
  const orderIds = Array.isArray(state?.orderIds) ? state.orderIds : [];

  if (orderIds.length === 0) {
    return (
      <section className="min-h-[65vh] bg-stone-50 dark:bg-stone-950 px-4 py-10 grid place-items-center">
        <div className="w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-7 md:p-10 text-center">
          <ClipboardList className="mx-auto text-brand-700" size={38} aria-hidden="true" />
          <h1 className="mt-5 text-3xl font-extrabold text-stone-900 dark:text-stone-100">Acompanhe seus pedidos</h1>
          <p className="mt-3 text-stone-600 dark:text-stone-400">A confirmação desta compra não está mais disponível, mas seu histórico continua salvo.</p>
          <Link to="/pedidos" className="btn-primary mt-6 min-h-12">Ver meus pedidos</Link>
        </div>
      </section>
    );
  }

  const label = orderIds.length === 1
    ? "1 pedido foi criado e enviado ao produtor."
    : `${orderIds.length} pedidos foram criados e enviados aos produtores.`;

  return (
    <section className="min-h-[65vh] bg-stone-50 dark:bg-stone-950 px-4 py-8 md:py-12 grid place-items-center">
      <div className="w-full max-w-2xl overflow-hidden bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-sm">
        <div className="h-2 bg-brand-600" />
        <div className="p-7 md:p-11 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 grid place-items-center">
            <Check size={34} strokeWidth={3} aria-hidden="true" />
          </div>
          <p className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-800 dark:text-brand-300">
            <Leaf size={16} aria-hidden="true" /> Mark Fruit
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">Pedido confirmado!</h1>
          <p className="mt-3 text-lg text-stone-600 dark:text-stone-400">{label}</p>

          <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-left text-sm text-amber-950">
            <strong className="block">Demonstração acadêmica</strong>
            <span>Nenhum valor foi cobrado. O pagamento registrado neste projeto é apenas uma simulação.</span>
          </div>

          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
            <Link to="/pedidos" className="btn-primary min-h-12">
              Acompanhar pedidos <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/" className="btn-secondary min-h-12">Continuar explorando</Link>
          </div>
        </div>
      </div>
    </section>
  );
}

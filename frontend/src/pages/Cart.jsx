import { Link } from "react-router-dom";
import { ArrowRight, Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext.jsx";
import { resolveImage } from "../services/supabase.js";
import { formatCurrency } from "../utils/format.js";

export default function Cart() {
  const { items, itemCount, subtotal, setQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4 py-12 bg-stone-50 dark:bg-stone-950">
        <section className="max-w-md text-center">
          <div className="mx-auto w-16 h-16 grid place-items-center rounded-full bg-brand-100 text-brand-800">
            <ShoppingBasket size={30}/>
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-stone-900 dark:text-stone-100">
            Seu carrinho está vazio
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400">
            Escolha produtos frescos de produtores da sua região.
          </p>
          <Link to="/" className="btn-primary mt-6">Explorar produtos</Link>
        </section>
      </div>
    );
  }

  const groups = Object.values(items.reduce((result, item) => {
    const producerId = item.authorId || item.author?.id || "unknown";
    if (!result[producerId]) {
      result[producerId] = {
        id: producerId,
        name: item.author?.name || "Produtor local",
        items: [],
      };
    }
    result[producerId].items.push(item);
    return result;
  }, {}));

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-[calc(100vh-7rem)] px-4 py-6 md:py-8 pb-24 md:pb-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-700">Compra direta</p>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">Seu carrinho</h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">
            {itemCount} {itemCount === 1 ? "item" : "itens"} de {groups.length} {groups.length === 1 ? "produtor" : "produtores"}
          </p>
        </div>

        <div className="grid md:grid-cols-[minmax(0,1fr)_19rem] gap-5 items-start">
          <div className="space-y-4">
            {groups.map((group) => (
              <section key={group.id} className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl overflow-hidden">
                <h2 className="px-4 py-3 text-sm font-bold text-stone-700 dark:text-stone-200 border-b border-stone-100 dark:border-stone-800">
                  {group.name}
                </h2>
                <div className="divide-y divide-stone-100 dark:divide-stone-800">
                  {group.items.map((item) => (
                    <article key={item.id} className="p-4 grid grid-cols-[5rem_1fr] sm:grid-cols-[6rem_1fr_auto] gap-4 items-center">
                      <img
                        src={resolveImage(item.image)}
                        alt=""
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover bg-stone-100"
                      />
                      <div className="min-w-0">
                        <Link to={`/post/${item.id}`} className="font-bold text-stone-900 dark:text-stone-100 hover:text-brand-700">
                          {item.title}
                        </Link>
                        <p className="mt-1 text-sm text-stone-500">{formatCurrency(item.price)} cada</p>
                        <div className="mt-3 inline-flex items-center border border-stone-300 dark:border-stone-700 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            aria-label={`Diminuir quantidade de ${item.title}`}
                            onClick={() => setQuantity(item.id, item.quantity - 1)}
                            className="w-11 h-11 grid place-items-center hover:bg-stone-100 dark:hover:bg-stone-800"
                          >
                            <Minus size={16}/>
                          </button>
                          <span className="w-10 text-center font-bold" aria-live="polite">{item.quantity}</span>
                          <button
                            type="button"
                            aria-label={`Aumentar quantidade de ${item.title}`}
                            onClick={() => setQuantity(item.id, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="w-11 h-11 grid place-items-center hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-40"
                          >
                            <Plus size={16}/>
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        aria-label={`Remover ${item.title}`}
                        onClick={() => removeItem(item.id)}
                        className="col-start-2 sm:col-start-auto justify-self-start sm:justify-self-end min-h-11 inline-flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-800"
                      >
                        <Trash2 size={16}/> Remover
                      </button>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 md:sticky md:top-32">
            <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">Resumo</h2>
            <div className="mt-4 flex justify-between text-stone-600 dark:text-stone-300">
              <span>Produtos</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700 flex justify-between items-end">
              <span className="font-bold">Total</span>
              <strong className="text-2xl text-stone-900 dark:text-stone-100">{formatCurrency(subtotal)}</strong>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-500">
              Entrega ou retirada será escolhida na próxima etapa.
            </p>
            <Link to="/checkout" className="btn-primary w-full mt-5 min-h-12">
              Continuar para o checkout <ArrowRight size={18}/>
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

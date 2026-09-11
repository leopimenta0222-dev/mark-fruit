import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, MapPin, PackageCheck, Store } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { createCheckout } from "../services/orders.js";
import { formatCurrency } from "../utils/format.js";

function submissionToken() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const token = useRef(submissionToken());
  const [fulfillmentMethod, setFulfillmentMethod] = useState("PICKUP");
  const [paymentMethod, setPaymentMethod] = useState("SIMULATED_PIX");
  const [address, setAddress] = useState({
    street: "",
    number: "",
    complement: "",
    city: user?.city || "",
    state: user?.state || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] grid place-items-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-extrabold">Adicione produtos antes do checkout</h1>
          <Link to="/" className="btn-primary mt-5">Explorar produtos</Link>
        </div>
      </div>
    );
  }

  function updateAddress(field, value) {
    setAddress((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    if (fulfillmentMethod === "DELIVERY") {
      const required = [address.street, address.number, address.city, address.state];
      if (required.some((value) => !value.trim())) {
        setError("Preencha o endereço completo para receber o pedido.");
        return;
      }
    }

    setSubmitting(true);
    try {
      const orderIds = await createCheckout({
        items,
        fulfillmentMethod,
        address: fulfillmentMethod === "DELIVERY" ? address : {},
        paymentMethod,
        submissionToken: token.current,
      });
      clearCart();
      navigate("/pedido-confirmado", { replace: true, state: { orderIds } });
    } catch (caught) {
      setError(caught.message || "Não foi possível criar o pedido. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-stone-50 dark:bg-stone-950 min-h-[calc(100vh-7rem)] px-4 py-6 md:py-8 pb-24 md:pb-8">
      <form onSubmit={submit} className="max-w-6xl mx-auto">
        <div className="mb-6">
          <p className="text-sm font-semibold text-brand-700">Finalização</p>
          <h1 className="text-3xl font-extrabold text-stone-900 dark:text-stone-100">Confirmar pedido</h1>
          <p className="mt-1 text-stone-600 dark:text-stone-400">Revise como deseja receber e conclua a simulação.</p>
        </div>

        <div className="grid md:grid-cols-[minmax(0,1fr)_20rem] gap-5 items-start">
          <div className="space-y-5">
            <fieldset className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
              <legend className="px-1 text-lg font-extrabold">Como você quer receber?</legend>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <label className={`min-h-24 border-2 rounded-xl p-4 cursor-pointer ${fulfillmentMethod === "PICKUP" ? "border-brand-600 bg-brand-50 dark:bg-brand-950" : "border-stone-200 dark:border-stone-700"}`}>
                  <input className="sr-only" type="radio" name="fulfillment" value="PICKUP" checked={fulfillmentMethod === "PICKUP"} onChange={(event) => setFulfillmentMethod(event.target.value)} />
                  <span className="flex items-center gap-2 font-bold"><Store size={20}/> Retirada</span>
                  <span className="block mt-1 text-sm text-stone-500">Combine o local e o horário com o produtor.</span>
                </label>
                <label className={`min-h-24 border-2 rounded-xl p-4 cursor-pointer ${fulfillmentMethod === "DELIVERY" ? "border-brand-600 bg-brand-50 dark:bg-brand-950" : "border-stone-200 dark:border-stone-700"}`}>
                  <input className="sr-only" type="radio" name="fulfillment" value="DELIVERY" checked={fulfillmentMethod === "DELIVERY"} onChange={(event) => setFulfillmentMethod(event.target.value)} />
                  <span className="flex items-center gap-2 font-bold"><MapPin size={20}/> Entrega</span>
                  <span className="block mt-1 text-sm text-stone-500">Informe o endereço para o produtor.</span>
                </label>
              </div>
            </fieldset>

            {fulfillmentMethod === "DELIVERY" && (
              <fieldset className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
                <legend className="px-1 text-lg font-extrabold">Endereço de entrega</legend>
                <div className="mt-3 grid sm:grid-cols-[1fr_8rem] gap-4">
                  <label className="sm:col-span-1"><span className="label">Rua</span><input className="input" value={address.street} onChange={(event) => updateAddress("street", event.target.value)} /></label>
                  <label><span className="label">Número</span><input className="input" value={address.number} onChange={(event) => updateAddress("number", event.target.value)} /></label>
                  <label className="sm:col-span-2"><span className="label">Complemento (opcional)</span><input className="input" value={address.complement} onChange={(event) => updateAddress("complement", event.target.value)} /></label>
                  <label><span className="label">Cidade</span><input className="input" value={address.city} onChange={(event) => updateAddress("city", event.target.value)} /></label>
                  <label><span className="label">UF</span><input className="input" maxLength={2} value={address.state} onChange={(event) => updateAddress("state", event.target.value.toUpperCase())} /></label>
                </div>
              </fieldset>
            )}

            <fieldset className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5">
              <legend className="px-1 text-lg font-extrabold">Pagamento demonstrativo</legend>
              <div className="mt-3 grid sm:grid-cols-2 gap-3">
                <label className="min-h-16 border border-stone-200 dark:border-stone-700 rounded-xl p-4 cursor-pointer flex items-center gap-3">
                  <input type="radio" name="payment" value="SIMULATED_PIX" checked={paymentMethod === "SIMULATED_PIX"} onChange={(event) => setPaymentMethod(event.target.value)} />
                  <span><strong className="block">Pix simulado</strong><small className="text-stone-500">Aprovação imediata</small></span>
                </label>
                <label className="min-h-16 border border-stone-200 dark:border-stone-700 rounded-xl p-4 cursor-pointer flex items-center gap-3">
                  <input type="radio" name="payment" value="SIMULATED_CARD" checked={paymentMethod === "SIMULATED_CARD"} onChange={(event) => setPaymentMethod(event.target.value)} />
                  <span><strong className="block">Cartão simulado</strong><small className="text-stone-500">Sem dados bancários</small></span>
                </label>
              </div>
              <p className="mt-4 flex gap-2 text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <CheckCircle2 size={18} className="shrink-0"/> Pagamento simulado para fins acadêmicos. Nenhum valor será cobrado.
              </p>
            </fieldset>
          </div>

          <aside className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-5 md:sticky md:top-32">
            <h2 className="font-extrabold text-lg flex items-center gap-2"><PackageCheck size={20}/> Resumo</h2>
            <p className="mt-3 text-sm text-stone-500">{items.length} {items.length === 1 ? "produto" : "produtos"}</p>
            <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-end">
              <span className="font-bold">Total</span>
              <strong className="text-2xl">{formatCurrency(subtotal)}</strong>
            </div>
            {error && <div role="alert" className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-800">{error}</div>}
            <button type="submit" disabled={submitting} className="btn-primary w-full min-h-12 mt-5">
              {submitting ? "Confirmando..." : "Confirmar pedido simulado"}
            </button>
            <Link to="/carrinho" className="btn-secondary w-full mt-2">Voltar ao carrinho</Link>
          </aside>
        </div>
      </form>
    </div>
  );
}

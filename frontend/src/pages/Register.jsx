import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sprout, ShoppingBasket, Tractor } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const [role, setRole] = useState("CONSUMER");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    state: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  function up(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, role });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="card p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white grid place-items-center mb-3">
            <Sprout size={28}/>
          </div>
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="text-stone-500 text-sm">Junte-se ao Mark Fruit</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole("CONSUMER")}
            className={`p-4 rounded-xl border-2 transition text-left ${
              role === "CONSUMER" ? "border-brand-500 bg-brand-50" : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <ShoppingBasket className="mb-2 text-brand-600" />
            <div className="font-bold">Consumidor</div>
            <div className="text-xs text-stone-500">Quero comprar</div>
          </button>
          <button
            type="button"
            onClick={() => setRole("PRODUCER")}
            className={`p-4 rounded-xl border-2 transition text-left ${
              role === "PRODUCER" ? "border-brand-500 bg-brand-50" : "border-stone-200 hover:border-stone-300"
            }`}
          >
            <Tractor className="mb-2 text-brand-600" />
            <div className="font-bold">Produtor</div>
            <div className="text-xs text-stone-500">Quero vender</div>
          </button>
        </div>

        <form onSubmit={onSubmit} className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="label">Nome completo</label>
            <input className="input" required value={form.name} onChange={(e) => up("name", e.target.value)}/>
          </div>
          <div className="col-span-2">
            <label className="label">Email</label>
            <input type="email" className="input" required value={form.email} onChange={(e) => up("email", e.target.value)}/>
          </div>
          <div className="col-span-2">
            <label className="label">Senha</label>
            <input type="password" className="input" required minLength={6} value={form.password} onChange={(e) => up("password", e.target.value)}/>
          </div>
          <div className="col-span-2">
            <label className="label">Telefone</label>
            <input className="input" value={form.phone} onChange={(e) => up("phone", e.target.value)}/>
          </div>
          <div>
            <label className="label">Cidade</label>
            <input className="input" value={form.city} onChange={(e) => up("city", e.target.value)}/>
          </div>
          <div>
            <label className="label">UF</label>
            <input className="input" maxLength={2} value={form.state} onChange={(e) => up("state", e.target.value.toUpperCase())}/>
          </div>

          {error && <p className="col-span-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}

          <button className="btn-primary col-span-2" disabled={loading}>
            {loading ? "Criando..." : "Criar conta"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Já tem conta?{" "}
          <Link to="/login" className="text-brand-700 font-semibold hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

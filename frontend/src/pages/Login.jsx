import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sprout, Mail, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      const to = location.state?.from?.pathname || "/";
      navigate(to, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao entrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-brand-600 text-white grid place-items-center mb-3">
            <Sprout size={28}/>
          </div>
          <h1 className="text-2xl font-bold">Entrar no Mark Fruit</h1>
          <p className="text-stone-500 text-sm">Bem-vindo de volta</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-stone-400"/>
              <input
                type="email"
                required
                className="input pl-10"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label className="label">Senha</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-stone-400"/>
              <input
                type="password"
                required
                className="input pl-10"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Ainda não tem conta?{" "}
          <Link to="/cadastro" className="text-brand-700 font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>

        <div className="mt-6 p-3 bg-stone-50 rounded-lg text-xs text-stone-600 space-y-1">
          <p className="font-semibold">Logins de teste (senha: 123456):</p>
          <p>• Consumidor: ana@markfruit.com</p>
          <p>• Produtor: joaquim@markfruit.com</p>
        </div>
      </div>
    </div>
  );
}

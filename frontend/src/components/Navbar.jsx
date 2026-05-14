import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Sprout, Search, User, LogOut, MessageCircle, Plus, BookOpen,
  MapPin, Apple, Salad, Flower2, Sprout as SeedIcon, ChevronDown
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = [
  { name: "Frutas", icon: Apple, slug: "Frutas" },
  { name: "Verduras", icon: Salad, slug: "Verduras" },
  { name: "Plantas", icon: Flower2, slug: "Plantas" },
  { name: "Sementes", icon: SeedIcon, slug: "Sementes" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [q, setQ] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setQ(params.get("q") || "");
  }, [location.search]);

  function submitSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    navigate(`/?${params.toString()}`);
  }

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* Linha 1: verde escuro */}
      <div className="bg-brand-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white text-brand-600 grid place-items-center">
              <Sprout size={22}/>
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="font-extrabold text-lg">Mark Fruit</div>
              <div className="text-[10px] text-brand-100">Direto do produtor 🌱</div>
            </div>
          </Link>

          {/* Search central */}
          <form onSubmit={submitSearch} className="flex-1 max-w-3xl">
            <div className="flex items-stretch bg-white rounded-lg overflow-hidden shadow-sm">
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar tomate, alface, semente de morango..."
                className="flex-1 px-4 py-2.5 text-stone-800 placeholder:text-stone-400 outline-none text-sm"
              />
              <button type="submit" className="px-5 bg-stone-50 hover:bg-stone-100 text-stone-600 border-l border-stone-200">
                <Search size={20}/>
              </button>
            </div>
          </form>

          {/* Right area */}
          <div className="hidden md:flex items-center gap-1 shrink-0">
            {user ? (
              <>
                <Link to="/chats" className="px-3 py-2 rounded-lg hover:bg-brand-700 flex items-center gap-1 text-sm">
                  <MessageCircle size={16}/> Conversas
                </Link>
                {user.role === "PRODUCER" && (
                  <Link to="/posts/novo" className="px-3 py-2 rounded-lg bg-brand-500 hover:bg-brand-400 flex items-center gap-1 text-sm font-semibold">
                    <Plus size={16}/> Anunciar
                  </Link>
                )}
                <div className="relative group">
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-brand-700">
                    <div className="w-8 h-8 rounded-full bg-white text-brand-700 grid place-items-center font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <ChevronDown size={14}/>
                  </button>
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white text-stone-700 rounded-xl shadow-xl border border-stone-100 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition py-2">
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="font-semibold text-sm">{user.name}</p>
                      <p className="text-xs text-stone-500">
                        {user.role === "PRODUCER" ? "🚜 Produtor" : "🛒 Consumidor"}
                      </p>
                    </div>
                    <Link to="/perfil" className="flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-sm">
                      <User size={14}/> Meu perfil
                    </Link>
                    <button
                      onClick={() => { logout(); navigate("/login"); }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-stone-50 text-sm text-red-600"
                    >
                      <LogOut size={14}/> Sair
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="px-3 py-2 rounded-lg hover:bg-brand-700 text-sm">
                  Entrar
                </Link>
                <Link to="/cadastro" className="px-4 py-2 rounded-lg bg-white text-brand-700 hover:bg-brand-50 text-sm font-semibold">
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Linha 2: categorias */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 h-11 flex items-center gap-1 overflow-x-auto">
          <Link to="/" className="px-3 py-1.5 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 whitespace-nowrap">
            <MapPin size={14} className="text-brand-600"/> Início
          </Link>
          {CATEGORIES.map((c) => {
            const Icon = c.icon;
            return (
              <Link
                key={c.slug}
                to={`/?category=${c.slug}`}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 whitespace-nowrap"
              >
                <Icon size={14} className="text-brand-600"/> {c.name}
              </Link>
            );
          })}
          <Link to="/como-plantar" className="px-3 py-1.5 rounded-md text-sm font-medium text-stone-700 hover:bg-stone-100 flex items-center gap-1.5 whitespace-nowrap">
            <BookOpen size={14} className="text-brand-600"/> Como Plantar
          </Link>
        </div>
      </div>
    </header>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Search, MapPin, TrendingUp, Sparkles, Flame, Star, Apple, Salad, Flower2,
  Sprout as SeedIcon, Truck, ShieldCheck, BookOpen
} from "lucide-react";
import { api } from "../services/api.js";
import PostCard from "../components/PostCard.jsx";
import Shelf from "../components/Shelf.jsx";

const CATEGORIES = [
  { name: "Frutas", icon: Apple, color: "bg-rose-100 text-rose-700" },
  { name: "Verduras", icon: Salad, color: "bg-brand-100 text-brand-700" },
  { name: "Plantas", icon: Flower2, color: "bg-violet-100 text-violet-700" },
  { name: "Sementes", icon: SeedIcon, color: "bg-amber-100 text-amber-700" },
];

export default function Home() {
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [coords, setCoords] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const filterCategory = searchParams.get("category") || "";

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => setCoords({ lat: -23.5505, lon: -46.6333 })
      );
    } else {
      setCoords({ lat: -23.5505, lon: -46.6333 });
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [q, filterCategory, coords]);

  async function fetchPosts() {
    setLoading(true);
    const params = { sort: "best" };
    if (q) params.q = q;
    if (filterCategory) params.category = filterCategory;
    if (coords) { params.lat = coords.lat; params.lon = coords.lon; }
    const { data } = await api.get("/posts", { params });
    setAllPosts(data);
    setLoading(false);
  }

  // Prateleiras
  const topRated = useMemo(() =>
    [...allPosts].sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0)).slice(0, 12)
  , [allPosts]);

  const nearest = useMemo(() =>
    [...allPosts]
      .filter((p) => p.distanceKm != null)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 12)
  , [allPosts]);

  const newest = useMemo(() =>
    [...allPosts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 12)
  , [allPosts]);

  const byCategory = (cat) => allPosts.filter((p) => p.category === cat).slice(0, 12);

  const isFiltering = q || filterCategory;

  return (
    <div className="bg-stone-100 min-h-[calc(100vh-7rem)]">
      {/* Hero / Banner */}
      {!isFiltering && (
        <section className="bg-gradient-to-r from-brand-600 via-brand-500 to-emerald-500 text-white">
          <div className="max-w-7xl mx-auto px-4 py-10 md:py-14">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">
                100% direto do produtor
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">
                Frutas, verduras e plantas <span className="text-amber-200">fresquinhas</span>
              </h1>
              <p className="mt-3 text-brand-50 md:text-lg">
                Sem atravessador, sem agrotóxico e perto de você.
              </p>
              <div className="mt-5 flex gap-3 flex-wrap">
                <Link to="/?category=Frutas" className="px-5 py-2.5 bg-white text-brand-700 font-bold rounded-lg hover:bg-brand-50 transition">
                  Ver frutas
                </Link>
                <Link to="/como-plantar" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 font-bold rounded-lg transition flex items-center gap-2">
                  <BookOpen size={16}/> Aprender a plantar
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Selos */}
      {!isFiltering && (
        <div className="bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2 text-stone-700">
              <Truck size={18} className="text-brand-600"/> Frete grátis acima de R$ 30
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <ShieldCheck size={18} className="text-brand-600"/> Compra protegida
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <Star size={18} className="text-amber-500"/> Produtores avaliados
            </div>
            <div className="flex items-center gap-2 text-stone-700">
              <MapPin size={18} className="text-brand-600"/> Perto de você
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Categorias rápidas */}
        {!isFiltering && (
          <div className="grid grid-cols-4 gap-3">
            {CATEGORIES.map((c) => {
              const Icon = c.icon;
              return (
                <Link
                  key={c.name}
                  to={`/?category=${c.name}`}
                  className="bg-white rounded-xl p-4 hover:shadow-md transition border border-stone-100 flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 rounded-2xl grid place-items-center ${c.color} group-hover:scale-110 transition`}>
                    <Icon size={26}/>
                  </div>
                  <span className="text-sm font-semibold text-stone-700">{c.name}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Resultado filtrado */}
        {isFiltering && (
          <section className="bg-white rounded-xl border border-stone-100 p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-bold">
                  {q ? `Resultados para "${q}"` : `Categoria: ${filterCategory}`}
                </h1>
                <p className="text-sm text-stone-500 mt-0.5">
                  {allPosts.length} {allPosts.length === 1 ? "produto encontrado" : "produtos encontrados"}
                </p>
              </div>
              <button
                onClick={() => setSearchParams({})}
                className="text-sm text-brand-700 font-semibold hover:underline"
              >
                Limpar filtros
              </button>
            </div>

            {loading ? (
              <SkeletonGrid/>
            ) : allPosts.length === 0 ? (
              <div className="text-center py-12 text-stone-500">
                <p className="text-lg">Nada encontrado por aqui</p>
                <p className="text-sm mt-1">Tente outra busca ou categoria.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {allPosts.map((p) => <PostCard key={p.id} post={p}/>)}
              </div>
            )}
          </section>
        )}

        {/* Prateleiras (só na home sem filtro) */}
        {!isFiltering && (
          loading ? (
            <SkeletonShelf/>
          ) : (
            <>
              <Shelf
                title="Melhores para você"
                subtitle="Combinação de avaliação e proximidade"
                icon={<Sparkles className="text-amber-500"/>}
                posts={allPosts.slice(0, 12)}
              />
              {nearest.length > 0 && (
                <Shelf
                  title="Perto de você"
                  subtitle="Produtores na sua região"
                  icon={<MapPin className="text-brand-600"/>}
                  posts={nearest}
                />
              )}
              <Shelf
                title="Mais bem avaliados"
                icon={<TrendingUp className="text-brand-600"/>}
                posts={topRated}
              />
              <Shelf
                title="Frutas em destaque"
                icon={<Apple className="text-rose-500"/>}
                posts={byCategory("Frutas")}
                viewAllHref="/?category=Frutas"
              />
              <Shelf
                title="Verduras frescas"
                icon={<Salad className="text-brand-600"/>}
                posts={byCategory("Verduras")}
                viewAllHref="/?category=Verduras"
              />
              <Shelf
                title="Sementes pra começar a plantar"
                icon={<SeedIcon className="text-amber-600"/>}
                posts={byCategory("Sementes")}
                viewAllHref="/?category=Sementes"
              />
              <Shelf
                title="Acabaram de chegar"
                icon={<Flame className="text-orange-500"/>}
                posts={newest}
              />
            </>
          )
        )}
      </div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-lg border border-stone-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-stone-200"/>
          <div className="p-3 space-y-2">
            <div className="h-3 bg-stone-200 rounded w-3/4"/>
            <div className="h-5 bg-stone-200 rounded w-1/2"/>
            <div className="h-3 bg-stone-200 rounded w-2/3"/>
          </div>
        </div>
      ))}
    </div>
  );
}

function SkeletonShelf() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-5">
          <div className="h-6 bg-stone-200 rounded w-48 animate-pulse mb-4"/>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, j) => (
              <div key={j} className="w-52 shrink-0 bg-white rounded-lg border border-stone-100 animate-pulse">
                <div className="aspect-square bg-stone-200"/>
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-stone-200 rounded w-3/4"/>
                  <div className="h-5 bg-stone-200 rounded w-1/2"/>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

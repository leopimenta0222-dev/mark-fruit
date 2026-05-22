import { Link } from "react-router-dom";
import { MapPin, Truck } from "lucide-react";
import Stars from "./Stars.jsx";
import { resolveImage } from "../services/supabase.js";

function fmtPrice(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PostCard({ post, compact = false }) {
  const img = resolveImage(post.image);
  const installments = Math.min(6, Math.max(1, Math.floor(post.price / 5)));
  const installmentValue = post.price / installments;
  const freeShipping = post.price >= 30;
  // simula desconto fake só na vitrine — se preço termina com .5 ou múltiplo de 7
  const showFakeDiscount = post.id % 3 === 0;
  const oldPrice = showFakeDiscount ? post.price * 1.2 : null;
  const discountPct = showFakeDiscount ? 20 : null;

  return (
    <Link
      to={`/post/${post.id}`}
      className="group bg-white rounded-lg border border-stone-200 hover:shadow-lg hover:border-brand-300 transition flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square bg-stone-50 overflow-hidden">
        <img
          src={img}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
          onError={(e) => (e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23e7e5e4' width='1' height='1'/%3E%3C/svg%3E")}
        />
        {discountPct && (
          <span className="absolute top-2 left-2 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded">
            -{discountPct}%
          </span>
        )}
        {post.isSeed && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-900 rounded uppercase">
            Semente
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm text-stone-800 line-clamp-2 leading-snug min-h-[2.5rem]">
          {post.title}
        </h3>

        <div className="mt-2 flex items-baseline gap-2">
          {oldPrice && (
            <span className="text-xs text-stone-400 line-through">
              {fmtPrice(oldPrice)}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-light text-stone-900 leading-none">
            {fmtPrice(post.price)}
          </span>
        </div>

        <p className="mt-1 text-xs text-brand-700 font-medium">
          em {installments}x {fmtPrice(installmentValue)} sem juros
        </p>

        {freeShipping && (
          <p className="mt-1 text-xs font-bold text-brand-700 flex items-center gap-1">
            <Truck size={12}/> Frete grátis
          </p>
        )}

        <div className="mt-2 flex items-center gap-1">
          <Stars value={post.averageRating || 0} size={12}/>
          {post.ratingCount > 0 && (
            <span className="text-xs text-stone-500">({post.ratingCount})</span>
          )}
        </div>

        {!compact && (
          <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="truncate max-w-[60%]">{post.author?.name}</span>
            {post.distanceKm != null && (
              <span className="flex items-center gap-0.5 shrink-0">
                <MapPin size={10}/>
                {post.distanceKm < 1 ? "perto" : `${Math.round(post.distanceKm)}km`}
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

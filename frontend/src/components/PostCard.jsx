import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import Stars from "./Stars.jsx";
import { resolveImage } from "../services/supabase.js";

function fmtPrice(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PostCard({ post, compact = false }) {
  const img = resolveImage(post.image);

  return (
    <Link
      to={`/post/${post.id}`}
      className="group bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700 hover:shadow-lg hover:border-brand-300 transition flex flex-col overflow-hidden"
    >
      <div className="relative aspect-square bg-stone-50 dark:bg-stone-900 overflow-hidden">
        <img
          src={img}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition"
          onError={(e) => (e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1 1'%3E%3Crect fill='%23e7e5e4' width='1' height='1'/%3E%3C/svg%3E")}
        />
        {post.isSeed && (
          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-amber-900 rounded uppercase">
            Semente
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h3 className="text-sm text-stone-800 dark:text-stone-100 line-clamp-2 leading-snug min-h-[2.5rem]">
          {post.title}
        </h3>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-2xl font-light text-stone-900 dark:text-stone-50 leading-none">
            {fmtPrice(post.price)}
          </span>
        </div>

        <div className="mt-2 flex items-center gap-1">
          <Stars value={post.averageRating || 0} size={12}/>
          {post.ratingCount > 0 && (
            <span className="text-xs text-stone-500">({post.ratingCount})</span>
          )}
        </div>

        {!compact && (
          <div className="mt-2 pt-2 border-t border-stone-100 dark:border-stone-700 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
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

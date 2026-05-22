import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import PostCard from "./PostCard.jsx";

export default function Shelf({ title, subtitle, icon, posts, viewAllHref, accent = "brand" }) {
  const ref = useRef(null);

  function scroll(dir) {
    const el = ref.current;
    if (!el) return;
    const cardWidth = el.firstChild?.firstChild?.offsetWidth || 200;
    el.scrollBy({ left: dir * (cardWidth + 12) * 3, behavior: "smooth" });
  }

  if (!posts?.length) return null;

  return (
    <section className="bg-white dark:bg-stone-800 rounded-xl shadow-sm border border-stone-100 dark:border-stone-700 overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between border-b border-stone-100 dark:border-stone-700">
        <div>
          <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            {icon} {title}
          </h2>
          {subtitle && <p className="text-sm text-stone-500 dark:text-stone-400 mt-0.5">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link to={viewAllHref} className="hidden md:flex items-center gap-1 text-sm font-semibold text-brand-700 hover:text-brand-800">
            Ver todos <ArrowRight size={16}/>
          </Link>
        )}
      </div>

      <div className="relative group/shelf">
        <div ref={ref} className="flex overflow-x-auto gap-3 p-4 scroll-smooth snap-x snap-mandatory scrollbar-thin">
          {posts.map((p) => (
            <div key={p.id} className="w-44 sm:w-52 shrink-0 snap-start">
              <PostCard post={p} compact />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll(-1)}
          className="hidden md:grid place-items-center absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-stone-700 dark:text-stone-100 shadow-lg border border-stone-200 dark:border-stone-600 opacity-0 group-hover/shelf:opacity-100 transition hover:bg-brand-50 dark:hover:bg-stone-600"
        >
          <ChevronLeft size={20}/>
        </button>
        <button
          onClick={() => scroll(1)}
          className="hidden md:grid place-items-center absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-stone-700 dark:text-stone-100 shadow-lg border border-stone-200 dark:border-stone-600 opacity-0 group-hover/shelf:opacity-100 transition hover:bg-brand-50 dark:hover:bg-stone-600"
        >
          <ChevronRight size={20}/>
        </button>
      </div>
    </section>
  );
}

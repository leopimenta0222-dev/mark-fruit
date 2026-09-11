import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <section className="min-h-[65vh] bg-stone-50 dark:bg-stone-950 px-4 py-10 grid place-items-center">
      <div className="max-w-2xl text-center">
        <div className="relative mx-auto h-32 w-32" aria-hidden="true">
          <span className="absolute bottom-0 left-1/2 h-14 w-24 -translate-x-1/2 rounded-[50%] bg-amber-900/20" />
          <Sprout className="absolute bottom-5 left-1/2 -translate-x-1/2 text-brand-600" size={72} strokeWidth={1.6} />
          <span className="absolute right-1 top-0 text-5xl font-black text-stone-200 dark:text-stone-800">404</span>
        </div>
        <p className="mt-5 text-sm font-bold uppercase tracking-widest text-brand-700">Caminho não encontrado</p>
        <h1 className="mt-2 text-3xl md:text-4xl font-extrabold tracking-tight">Essa página não brotou</h1>
        <p className="mx-auto mt-3 max-w-lg text-stone-600 dark:text-stone-400">O endereço pode ter mudado ou ainda não existe. Você pode voltar à feira ou aproveitar para aprender algo novo.</p>
        <div className="mt-7 flex flex-col sm:flex-row justify-center gap-3">
          <Link to="/" className="btn-primary"><ArrowLeft size={18} /> Voltar ao início</Link>
          <Link to="/como-plantar" className="btn-secondary"><BookOpen size={18} /> Aprender a plantar</Link>
        </div>
      </div>
    </section>
  );
}

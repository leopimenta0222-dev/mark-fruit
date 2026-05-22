import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MessageCircle, MapPin, Send, Trash2, ShoppingCart, Zap, Truck,
  ShieldCheck, RotateCcw, ChevronRight, Minus, Plus, Store, Heart
} from "lucide-react";
import { resolveImage } from "../services/supabase.js";
import { getPost, ratePost, deleteRating, deletePost } from "../services/db.js";
import { useAuth } from "../context/AuthContext.jsx";
import Stars from "../components/Stars.jsx";

function fmtPrice(v) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function fmtDate(d) {
  return new Date(d).toLocaleDateString("pt-BR");
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // compra (ainda não processa pagamento)
  const [qty, setQty] = useState(1);
  const [buyMsg, setBuyMsg] = useState("");

  // avaliação
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    try {
      const data = await getPost(id);
      setPost(data);
      setQty(1);
      const myRating = data.ratings.find((r) => r.userId === user?.id);
      if (myRating) {
        setStars(myRating.stars);
        setComment(myRating.comment || "");
      } else {
        setStars(0); setComment("");
      }
    } finally {
      setLoading(false);
    }
  }

  async function submitRating(e) {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!stars) return;
    setSubmitting(true);
    try {
      await ratePost(post.id, user.id, stars, comment);
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteMyRating() {
    if (!confirm("Remover sua avaliação?")) return;
    await deleteRating(post.id, user.id);
    await load();
  }

  async function handleDeletePost() {
    if (!confirm("Excluir este anúncio?")) return;
    await deletePost(post.id);
    navigate("/");
  }

  function startChat() {
    if (!user) { navigate("/login"); return; }
    navigate(`/chat/${post.id}/${post.author.id}`);
  }

  function handleBuy(tipo) {
    setBuyMsg(
      tipo === "buy"
        ? "Pagamento ainda em desenvolvimento — em breve você poderá finalizar a compra aqui."
        : "Carrinho ainda em desenvolvimento — funcionalidade chegando em breve."
    );
    setTimeout(() => setBuyMsg(""), 4000);
  }

  if (loading || !post) return <div className="p-8 text-center text-stone-500">Carregando...</div>;

  const isOwner = user?.id === post.author.id;
  const myRating = post.ratings.find((r) => r.userId === user?.id);

  // dados comerciais (mesma lógica do card)
  const installments = Math.min(10, Math.max(1, Math.floor(post.price / 5)));
  const installmentValue = post.price / installments;
  const freeShipping = post.price >= 30;
  const showDiscount = post.id % 3 === 0;
  const oldPrice = showDiscount ? post.price * 1.2 : null;
  const discountPct = showDiscount ? 20 : null;
  const total = post.price * qty;

  return (
    <div className="bg-stone-100 dark:bg-stone-950 min-h-[calc(100vh-7rem)]">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400 mb-4">
          <Link to="/" className="hover:text-brand-700">Início</Link>
          <ChevronRight size={12}/>
          <Link to={`/?category=${post.category}`} className="hover:text-brand-700">{post.category}</Link>
          <ChevronRight size={12}/>
          <span className="text-stone-400 truncate">{post.title}</span>
        </nav>

        {/* Bloco principal: imagem + info + caixa de compra */}
        <div className="bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div className="grid lg:grid-cols-12 gap-0">
            {/* Imagem */}
            <div className="lg:col-span-5 p-5 flex items-start justify-center border-b lg:border-b-0 lg:border-r border-stone-100 dark:border-stone-700">
              <div className="relative w-full">
                <img
                  src={resolveImage(post.image)}
                  alt={post.title}
                  className="w-full aspect-square object-cover rounded-lg"
                />
                {discountPct && (
                  <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-bold bg-red-500 text-white rounded">
                    -{discountPct}% OFF
                  </span>
                )}
              </div>
            </div>

            {/* Info do produto */}
            <div className="lg:col-span-4 p-5">
              <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
                {post.category}
              </span>
              <h1 className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-100 leading-snug">{post.title}</h1>

              <div className="mt-2 flex items-center gap-2">
                <Stars value={post.averageRating} size={15}/>
                <span className="text-sm text-stone-500 dark:text-stone-400">
                  {post.averageRating ? post.averageRating.toFixed(1) : "Sem notas"}
                  {post.ratingCount > 0 && ` · ${post.ratingCount} avaliações`}
                </span>
              </div>

              {/* Preço */}
              <div className="mt-4">
                {oldPrice && (
                  <p className="text-sm text-stone-400 line-through">{fmtPrice(oldPrice)}</p>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-light text-stone-900 dark:text-stone-50">{fmtPrice(post.price)}</span>
                  {discountPct && (
                    <span className="text-sm font-bold text-brand-600">{discountPct}% OFF</span>
                  )}
                </div>
                <p className="mt-1 text-sm text-brand-700 font-medium">
                  em {installments}x de {fmtPrice(installmentValue)} sem juros
                </p>
              </div>

              {freeShipping && (
                <p className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-brand-700">
                  <Truck size={16}/> Frete grátis
                </p>
              )}

              <div className="mt-5 pt-5 border-t border-stone-100 dark:border-stone-700">
                <h3 className="font-bold text-stone-800 dark:text-stone-100 mb-2">Descrição</h3>
                <p className="text-stone-600 dark:text-stone-300 text-sm whitespace-pre-wrap leading-relaxed">
                  {post.description}
                </p>
              </div>
            </div>

            {/* Caixa de compra */}
            <div className="lg:col-span-3 p-5 lg:border-l border-stone-100 dark:border-stone-700 bg-stone-50/50 dark:bg-stone-900/40">
              <div className="lg:sticky lg:top-28 space-y-4">
                {/* Estoque */}
                <div>
                  {post.stock > 0 ? (
                    <p className="text-sm font-semibold text-stone-800 dark:text-stone-100">Estoque disponível</p>
                  ) : (
                    <p className="text-sm font-semibold text-red-600">Sem estoque</p>
                  )}
                  <p className="text-xs text-stone-500 dark:text-stone-400">{post.stock} unidades</p>
                </div>

                {/* Seletor de quantidade */}
                <div>
                  <label className="text-xs text-stone-500 dark:text-stone-400">Quantidade</label>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center border border-stone-300 dark:border-stone-600 rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                        disabled={qty <= 1}
                      >
                        <Minus size={14}/>
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold min-w-[2.5rem] text-center dark:text-stone-100">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty((q) => Math.min(post.stock, q + 1))}
                        className="px-2.5 py-1.5 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                        disabled={qty >= post.stock}
                      >
                        <Plus size={14}/>
                      </button>
                    </div>
                    {qty > 1 && (
                      <span className="text-sm text-stone-500 dark:text-stone-400">
                        Total: <strong className="text-stone-800 dark:text-stone-100">{fmtPrice(total)}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Botões de compra */}
                {!isOwner ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => handleBuy("buy")}
                      disabled={post.stock <= 0}
                      className="btn-primary w-full !py-3"
                    >
                      <Zap size={18}/> Comprar agora
                    </button>
                    <button
                      onClick={() => handleBuy("cart")}
                      disabled={post.stock <= 0}
                      className="w-full btn !py-3 bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200"
                    >
                      <ShoppingCart size={18}/> Adicionar ao carrinho
                    </button>
                    <button onClick={startChat} className="btn-secondary w-full !py-3">
                      <MessageCircle size={18}/> Conversar com o produtor
                    </button>
                    <button
                      className="w-full btn !py-2 text-stone-500 hover:text-red-500 hover:bg-stone-100"
                    >
                      <Heart size={16}/> Favoritar
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-center text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-900 rounded-lg py-2">
                      Este é o seu anúncio
                    </p>
                    <button onClick={handleDeletePost} className="btn-danger w-full !py-2.5">
                      <Trash2 size={16}/> Excluir anúncio
                    </button>
                  </div>
                )}

                {buyMsg && (
                  <div className="text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg p-2.5">
                    {buyMsg}
                  </div>
                )}

                {/* Vendedor */}
                <Link
                  to={`/produtor/${post.author.id}`}
                  className="block pt-4 border-t border-stone-200 dark:border-stone-700"
                >
                  <p className="text-xs text-stone-500 dark:text-stone-400 mb-1.5 flex items-center gap-1">
                    <Store size={12}/> Vendido por
                  </p>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold">
                      {post.author.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate hover:text-brand-700 dark:text-stone-100">
                        {post.author.name}
                      </p>
                      {(post.author.city || post.author.state) && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                          <MapPin size={11}/>
                          {[post.author.city, post.author.state].filter(Boolean).join(" - ")}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>

                {/* Selos de confiança */}
                <div className="pt-4 border-t border-stone-200 dark:border-stone-700 space-y-2 text-xs text-stone-600 dark:text-stone-300">
                  <p className="flex items-center gap-2">
                    <ShieldCheck size={15} className="text-brand-600 shrink-0"/>
                    Compra protegida — receba o produto ou seu dinheiro de volta
                  </p>
                  <p className="flex items-center gap-2">
                    <RotateCcw size={15} className="text-brand-600 shrink-0"/>
                    Devolução grátis em até 7 dias
                  </p>
                  <p className="flex items-center gap-2">
                    <Truck size={15} className="text-brand-600 shrink-0"/>
                    {freeShipping ? "Frete grátis para sua região" : "Frete calculado na finalização"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Avaliações */}
        <section className="mt-6 bg-white dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 p-5 md:p-6">
          <h2 className="text-xl font-bold mb-4 dark:text-stone-100">
            Avaliações {post.ratingCount > 0 && <span className="text-stone-400">({post.ratingCount})</span>}
          </h2>

          {/* Resumo da nota */}
          {post.ratingCount > 0 && (
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-stone-100 dark:border-stone-700">
              <div className="text-center">
                <div className="text-4xl font-bold text-stone-800 dark:text-stone-100">
                  {post.averageRating.toFixed(1)}
                </div>
                <Stars value={post.averageRating} size={14}/>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">{post.ratingCount} avaliações</p>
              </div>
            </div>
          )}

          {!isOwner && user && (
            <form onSubmit={submitRating} className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-4 mb-5 border border-stone-100 dark:border-stone-700">
              <p className="font-semibold mb-2 dark:text-stone-100">
                {myRating ? "Sua avaliação" : "Avaliar este produto"}
              </p>
              <Stars value={stars} interactive onChange={setStars} size={28}/>
              <textarea
                className="input mt-3"
                placeholder="Conte como foi sua experiência com o produto..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <div className="mt-3 flex gap-2">
                <button className="btn-primary" disabled={!stars || submitting}>
                  <Send size={16}/> {myRating ? "Atualizar" : "Enviar avaliação"}
                </button>
                {myRating && (
                  <button type="button" onClick={deleteMyRating} className="btn-secondary text-red-600">
                    <Trash2 size={16}/> Remover
                  </button>
                )}
              </div>
            </form>
          )}

          {!user && !isOwner && (
            <div className="bg-stone-50 dark:bg-stone-900/50 rounded-xl p-5 mb-5 text-center border border-stone-100 dark:border-stone-700">
              <p className="text-stone-600 dark:text-stone-300 mb-2">Entre para deixar sua avaliação.</p>
              <Link to="/login" className="btn-primary">Entrar</Link>
            </div>
          )}

          <div className="space-y-3">
            {post.ratings.length === 0 && (
              <p className="text-stone-500 dark:text-stone-400 text-center py-6">
                Ainda não há avaliações. Seja o primeiro!
              </p>
            )}
            {post.ratings.map((r) => (
              <div key={r.id} className="border border-stone-100 dark:border-stone-700 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-1">
                  <div className="w-9 h-9 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-200 grid place-items-center font-bold">
                    {r.user.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm dark:text-stone-100">{r.user.name}</p>
                    <Stars value={r.stars} size={12}/>
                  </div>
                  <span className="ml-auto text-xs text-stone-400">{fmtDate(r.createdAt)}</span>
                </div>
                {r.comment && <p className="text-stone-700 dark:text-stone-300 ml-12 text-sm">{r.comment}</p>}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

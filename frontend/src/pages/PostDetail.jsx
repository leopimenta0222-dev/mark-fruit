import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { MessageCircle, MapPin, User, Send, Trash2 } from "lucide-react";
import { api, resolveImage } from "../services/api.js";
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

  // form de avaliação
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { load(); }, [id]);

  async function load() {
    setLoading(true);
    const { data } = await api.get(`/posts/${id}`);
    setPost(data);
    setLoading(false);
    const myRating = data.ratings.find((r) => r.userId === user?.id);
    if (myRating) {
      setStars(myRating.stars);
      setComment(myRating.comment || "");
    } else {
      setStars(0); setComment("");
    }
  }

  async function submitRating(e) {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    if (!stars) return;
    setSubmitting(true);
    try {
      await api.post(`/posts/${id}/ratings`, { stars, comment });
      await load();
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteMyRating() {
    if (!confirm("Remover sua avaliação?")) return;
    await api.delete(`/posts/${id}/ratings`);
    await load();
  }

  async function deletePost() {
    if (!confirm("Excluir este anúncio?")) return;
    await api.delete(`/posts/${id}`);
    navigate("/");
  }

  function startChat() {
    if (!user) { navigate("/login"); return; }
    navigate(`/chat/${post.id}/${post.author.id}`);
  }

  if (loading || !post) return <div className="p-8 text-center text-stone-500">Carregando...</div>;

  const isOwner = user?.id === post.author.id;
  const myRating = post.ratings.find((r) => r.userId === user?.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="card overflow-hidden">
          <img src={resolveImage(post.image)} alt={post.title} className="w-full aspect-square object-cover"/>
        </div>

        <div>
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-semibold bg-brand-50 text-brand-700">
            {post.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-stone-900">{post.title}</h1>

          <div className="mt-3 flex items-center gap-3">
            <Stars value={post.averageRating} count={post.ratingCount}/>
          </div>

          <div className="mt-4 text-3xl font-extrabold text-brand-700">{fmtPrice(post.price)}</div>
          <p className="text-sm text-stone-500">Estoque: {post.stock} un</p>

          <div className="mt-5 p-4 rounded-xl bg-stone-50 border border-stone-100">
            <Link to={`/produtor/${post.author.id}`} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-bold">
                {post.author.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold">{post.author.name}</p>
                {(post.author.city || post.author.state) && (
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin size={12}/> {[post.author.city, post.author.state].filter(Boolean).join(" - ")}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {!isOwner ? (
            <button onClick={startChat} className="btn-primary w-full mt-5">
              <MessageCircle size={18}/> Conversar com o produtor
            </button>
          ) : (
            <button onClick={deletePost} className="btn-danger w-full mt-5">
              <Trash2 size={18}/> Excluir anúncio
            </button>
          )}

          <div className="mt-6">
            <h3 className="font-bold mb-2">Descrição</h3>
            <p className="text-stone-700 whitespace-pre-wrap">{post.description}</p>
          </div>
        </div>
      </div>

      {/* Avaliações */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Avaliações ({post.ratingCount})</h2>

        {!isOwner && user && (
          <form onSubmit={submitRating} className="card p-5 mb-6">
            <p className="font-semibold mb-2">
              {myRating ? "Sua avaliação" : "Avaliar este produto"}
            </p>
            <Stars value={stars} interactive onChange={setStars} size={28}/>
            <textarea
              className="input mt-3"
              placeholder="Deixe um comentário (opcional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <button className="btn-primary" disabled={!stars || submitting}>
                <Send size={16}/> {myRating ? "Atualizar" : "Enviar"}
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
          <div className="card p-5 mb-6 text-center">
            <p className="text-stone-600 mb-2">Entre para deixar sua avaliação.</p>
            <Link to="/login" className="btn-primary">Entrar</Link>
          </div>
        )}

        <div className="space-y-3">
          {post.ratings.length === 0 && (
            <p className="text-stone-500 text-center py-6">Ainda não há avaliações.</p>
          )}
          {post.ratings.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-700 grid place-items-center font-bold">
                  {r.user.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm">{r.user.name}</p>
                  <Stars value={r.stars} size={12}/>
                </div>
                <span className="ml-auto text-xs text-stone-400">{fmtDate(r.createdAt)}</span>
              </div>
              {r.comment && <p className="text-stone-700 ml-12 text-sm">{r.comment}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

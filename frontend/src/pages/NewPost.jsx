import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Image as ImageIcon, Sprout } from "lucide-react";
import { uploadPostImage, createPost } from "../services/db.js";
import { useAuth } from "../context/AuthContext.jsx";

const CATEGORIES = ["Frutas", "Verduras", "Plantas", "Sementes"];

export default function NewPost() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "Frutas",
    stock: 1,
    isSeed: false,
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function up(k, v) {
    setForm((f) => {
      const next = { ...f, [k]: v };
      if (k === "category") next.isSeed = v === "Sementes";
      return next;
    });
  }

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    if (!file) {
      setError("Adicione uma imagem do produto.");
      return;
    }
    setLoading(true);
    try {
      const imageUrl = await uploadPostImage(file, user.id);
      const post = await createPost({
        title: form.title,
        description: form.description,
        price: form.price,
        category: form.category,
        isSeed: form.isSeed,
        stock: form.stock,
        imageUrl,
        authorId: user.id,
      });
      navigate(`/post/${post.id}`);
    } catch (err) {
      setError(err.message || "Erro ao criar anúncio");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white grid place-items-center">
          <Sprout size={22}/>
        </div>
        <div>
          <h1 className="text-2xl font-bold">Criar anúncio</h1>
          <p className="text-stone-500 text-sm">Compartilhe seu produto com a comunidade</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="card p-6 md:p-8 space-y-5">
        <div>
          <label className="label">Foto do produto</label>
          <label className="block cursor-pointer">
            <input type="file" accept="image/*" onChange={onFile} className="hidden"/>
            <div className="border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center hover:border-brand-400 transition">
              {preview ? (
                <img src={preview} alt="" className="mx-auto max-h-64 rounded-xl"/>
              ) : (
                <>
                  <ImageIcon size={40} className="mx-auto text-stone-400"/>
                  <p className="mt-2 text-sm text-stone-500">Clique para escolher uma foto</p>
                  <p className="text-xs text-stone-400">Max 5MB</p>
                </>
              )}
            </div>
          </label>
        </div>

        <div>
          <label className="label">Título</label>
          <input
            className="input" required maxLength={100}
            placeholder="Ex: Tomate orgânico 1kg"
            value={form.title} onChange={(e) => up("title", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Categoria</label>
            <select className="input" value={form.category} onChange={(e) => up("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Preço (R$)</label>
            <input type="number" step="0.01" min="0" required className="input"
              value={form.price} onChange={(e) => up("price", e.target.value)}/>
          </div>
        </div>

        <div>
          <label className="label">Estoque (unidades disponíveis)</label>
          <input type="number" min="1" className="input" value={form.stock} onChange={(e) => up("stock", e.target.value)}/>
        </div>

        <div>
          <label className="label">Descrição</label>
          <textarea required className="input min-h-[120px]"
            placeholder="Conte sobre o produto, como foi cultivado, sabor, modo de uso..."
            value={form.description} onChange={(e) => up("description", e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}

        <div className="flex gap-2 pt-2">
          <button className="btn-primary flex-1" disabled={loading}>
            <Upload size={16}/> {loading ? "Publicando..." : "Publicar anúncio"}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

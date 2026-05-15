import { useEffect, useState } from "react";
import { Save, MapPin, Phone, Mail, User as UserIcon, Edit3 } from "lucide-react";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Profile() {
  const { user, refresh } = useAuth();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (user) setForm({
      name: user.name || "",
      phone: user.phone || "",
      city: user.city || "",
      state: user.state || "",
      bio: user.bio || "",
    });
  }, [user]);

  if (!form) return null;

  function up(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function save() {
    setSaving(true);
    setMsg("");
    try {
      await api.put("/users/me", form);
      await refresh();
      setEdit(false);
      setMsg("Perfil atualizado!");
      setTimeout(() => setMsg(""), 2000);
    } catch {
      setMsg("Erro ao salvar");
    } finally {
      setSaving(false);
    }
  }

  async function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      await api.put("/users/me", {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });
      await refresh();
      setMsg("Localização atualizada!");
      setTimeout(() => setMsg(""), 2000);
    });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="card p-6 md:p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-brand-100 text-brand-700 grid place-items-center text-3xl font-extrabold">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <span className="inline-block mt-1 px-3 py-0.5 rounded-full text-xs font-semibold bg-brand-100 text-brand-700">
              {user.role === "PRODUCER" ? "Produtor" : "Consumidor"}
            </span>
          </div>
          {!edit && (
            <button onClick={() => setEdit(true)} className="btn-secondary">
              <Edit3 size={16}/> Editar
            </button>
          )}
        </div>

        {msg && <div className="mb-4 p-3 bg-brand-50 text-brand-700 rounded-lg text-sm">{msg}</div>}

        {edit ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Nome</label>
              <input className="input" value={form.name} onChange={(e) => up("name", e.target.value)}/>
            </div>
            <div className="col-span-2">
              <label className="label">Telefone</label>
              <input className="input" value={form.phone} onChange={(e) => up("phone", e.target.value)}/>
            </div>
            <div>
              <label className="label">Cidade</label>
              <input className="input" value={form.city} onChange={(e) => up("city", e.target.value)}/>
            </div>
            <div>
              <label className="label">UF</label>
              <input className="input" maxLength={2} value={form.state} onChange={(e) => up("state", e.target.value.toUpperCase())}/>
            </div>
            <div className="col-span-2">
              <label className="label">Bio</label>
              <textarea className="input min-h-[100px]" value={form.bio} onChange={(e) => up("bio", e.target.value)}
                placeholder={user.role === "PRODUCER" ? "Conte sobre sua produção..." : "Conte um pouco sobre você..."}
              />
            </div>
            <div className="col-span-2 flex gap-2">
              <button onClick={save} className="btn-primary" disabled={saving}>
                <Save size={16}/> {saving ? "Salvando..." : "Salvar"}
              </button>
              <button onClick={() => setEdit(false)} className="btn-secondary">Cancelar</button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-stone-700">
            <div className="flex items-center gap-2"><Mail size={16} className="text-stone-400"/> {user.email}</div>
            {user.phone && <div className="flex items-center gap-2"><Phone size={16} className="text-stone-400"/> {user.phone}</div>}
            {(user.city || user.state) && (
              <div className="flex items-center gap-2"><MapPin size={16} className="text-stone-400"/> {[user.city, user.state].filter(Boolean).join(" - ")}</div>
            )}
            {user.bio && (
              <div className="pt-3 border-t border-stone-100">
                <p className="text-sm text-stone-500 mb-1">Sobre</p>
                <p>{user.bio}</p>
              </div>
            )}
            <div className="pt-4 border-t border-stone-100">
              <button onClick={useMyLocation} className="btn-secondary">
                <MapPin size={16}/> Atualizar minha localização
              </button>
              <p className="text-xs text-stone-500 mt-2">
                Sua localização ajuda a mostrar produtos próximos.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

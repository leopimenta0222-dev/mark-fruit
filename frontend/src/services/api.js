import axios from "axios";

// Em desenvolvimento: vazio -> usa o proxy do Vite (/api -> localhost:3001).
// Em produção: defina VITE_API_URL no Vercel apontando pro backend no Render.
export const API_BASE = import.meta.env.VITE_API_URL || "";

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("markfruit:token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Resolve a URL de uma imagem de produto.
// Fotos do seed são URLs completas (http...). Uploads de produtores
// são caminhos relativos (/uploads/...) que precisam do domínio do backend.
export function resolveImage(src) {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return `${API_BASE}${src}`;
}

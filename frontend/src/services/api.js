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
// - http/data: usa como está
// - /products/...: imagens do seed, servidas pelo próprio frontend
// - /uploads/...: imagens enviadas por produtores, servidas pelo backend
export function resolveImage(src) {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  if (src.startsWith("/products/")) return src;
  return `${API_BASE}${src}`;
}

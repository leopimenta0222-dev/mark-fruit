import { createClient } from "@supabase/supabase-js";

// As credenciais vêm de variáveis de ambiente.
// Local: arquivo frontend/.env  (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
// Produção: variáveis no painel da Vercel.
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error(
    "Supabase não configurado: defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em frontend/.env"
  );
}

export const supabase = createClient(url, anonKey);

// Resolve a URL de uma imagem de produto.
// - http/data: usa como está (ex: Supabase Storage, Unsplash)
// - /products/...: imagens do seed servidas pelo próprio frontend
export function resolveImage(src) {
  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:")) return src;
  return src; // caminhos /products/... são servidos pelo frontend
}

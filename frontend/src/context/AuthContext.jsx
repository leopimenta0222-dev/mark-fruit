import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../services/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // perfil (profiles) + dados de auth
  const [loading, setLoading] = useState(true);

  // Carrega o perfil (tabela profiles) de um usuário autenticado
  async function loadProfile(authUser) {
    if (!authUser) { setUser(null); return; }
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();
    setUser({ ...profile, email: authUser.email });
  }

  useEffect(() => {
    // sessão atual ao abrir o app
    supabase.auth.getSession().then(async ({ data }) => {
      await loadProfile(data.session?.user);
      setLoading(false);
    });

    // ouve login/logout
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(traduzir(error.message));
    await loadProfile(data.user);
    return data.user;
  }

  async function register({ name, email, password, role, phone, city, state }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role, phone, city, state } },
    });
    if (error) throw new Error(traduzir(error.message));
    // o trigger handle_new_user cria o profile automaticamente
    if (data.user) await loadProfile(data.user);
    return data.user;
  }

  async function logout() {
    await supabase.auth.signOut();
    setUser(null);
  }

  async function refresh() {
    const { data } = await supabase.auth.getUser();
    await loadProfile(data.user);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

function traduzir(msg) {
  if (/invalid login credentials/i.test(msg)) return "Email ou senha inválidos";
  if (/user already registered/i.test(msg)) return "Email já cadastrado";
  if (/password should be at least/i.test(msg)) return "A senha deve ter ao menos 6 caracteres";
  if (/unable to validate email/i.test(msg)) return "Email inválido";
  return msg;
}

export function useAuth() {
  return useContext(AuthContext);
}

import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, Sprout } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { api } from "../services/api.js";
import PostCard from "../components/PostCard.jsx";

export default function ComoPlantar() {
  const [seeds, setSeeds] = useState([]);
  const [topics, setTopics] = useState([]);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Olá! 🌱 Eu sou o **PlantaBot**, posso te ensinar a cultivar várias plantas.\n\nÉ só me perguntar coisas como _\"como plantar tomate?\"_ ou clicar em uma das opções abaixo.",
    },
  ]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    api.get("/posts", { params: { isSeed: true, sort: "rating" } }).then((r) => setSeeds(r.data));
    api.get("/bot/topics").then((r) => setTopics(r.data));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function ask(msg) {
    const text = (msg ?? input).trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setThinking(true);
    try {
      const { data } = await api.post("/bot/ask", { message: text });
      setMessages((m) => [...m, { role: "bot", content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", content: "Ops, deu um problema. Tenta de novo." }]);
    } finally {
      setThinking(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-3">
          <Sparkles size={14}/> Aprenda a cultivar
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold">Como plantar 🌱</h1>
        <p className="text-stone-600 mt-2">
          Tire suas dúvidas com o PlantaBot e compre sementes direto dos nossos produtores.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Bot */}
        <div className="lg:col-span-2">
          <div className="card flex flex-col h-[600px]">
            <div className="p-4 border-b border-stone-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-600 text-white grid place-items-center">
                <Bot size={22}/>
              </div>
              <div>
                <p className="font-bold">PlantaBot</p>
                <p className="text-xs text-brand-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse"/> online
                </p>
              </div>
            </div>

            <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl ${
                      m.role === "user"
                        ? "bg-brand-600 text-white rounded-br-sm"
                        : "bg-white border border-stone-200 rounded-bl-sm"
                    }`}
                  >
                    <div className={`prose prose-sm max-w-none ${m.role === "user" ? "prose-invert" : ""}`}>
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 px-4 py-3 rounded-2xl flex gap-1">
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"/>
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:.1s]"/>
                    <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:.2s]"/>
                  </div>
                </div>
              )}
            </div>

            {topics.length > 0 && messages.length < 3 && (
              <div className="p-3 border-t border-stone-100 flex gap-2 flex-wrap">
                {topics.slice(0, 6).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => ask(`Como plantar ${t.name.toLowerCase()}?`)}
                    className="text-xs px-3 py-1.5 rounded-full bg-stone-100 hover:bg-brand-100 hover:text-brand-700 transition"
                  >
                    🌱 {t.name}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); ask(); }} className="p-3 border-t border-stone-100 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ex: como plantar tomate?"
                className="input"
              />
              <button className="btn-primary !px-4" type="submit" disabled={thinking}>
                <Send size={18}/>
              </button>
            </form>
          </div>
        </div>

        {/* Sementes à venda */}
        <aside>
          <div className="flex items-center gap-2 mb-4">
            <Sprout className="text-brand-600"/>
            <h2 className="text-xl font-bold">Sementes à venda</h2>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {seeds.length === 0 && (
              <p className="col-span-2 text-stone-500 text-sm">Nenhuma semente disponível ainda.</p>
            )}
            {seeds.map((s) => <PostCard key={s.id} post={s}/>)}
          </div>
        </aside>
      </div>
    </div>
  );
}

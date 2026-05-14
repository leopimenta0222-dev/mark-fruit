import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { api, resolveImage } from "../services/api.js";

function fmtTime(d) {
  const date = new Date(d);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("pt-BR");
}

export default function Conversations() {
  const [convs, setConvs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/conversations").then((r) => {
      setConvs(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle/> Conversas
      </h1>

      {loading ? (
        <p className="text-stone-500">Carregando...</p>
      ) : convs.length === 0 ? (
        <div className="card p-8 text-center">
          <MessageCircle size={48} className="mx-auto text-stone-300 mb-3"/>
          <p className="text-stone-500">Você ainda não tem conversas.</p>
          <p className="text-sm text-stone-400 mt-1">Quando conversar com um produtor, aparece aqui.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {convs.map((c) => (
            <Link
              key={`${c.postId}-${c.otherUser.id}`}
              to={`/chat/${c.postId}/${c.otherUser.id}`}
              className="card p-3 flex items-center gap-3 hover:shadow-md transition"
            >
              <img src={resolveImage(c.post.image)} alt="" className="w-14 h-14 rounded-xl object-cover"/>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{c.otherUser.name}</p>
                <p className="text-xs text-stone-500 truncate">{c.post.title}</p>
                <p className="text-sm text-stone-600 truncate mt-0.5">{c.lastMessage.content}</p>
              </div>
              <span className="text-xs text-stone-400">{fmtTime(c.lastMessage.createdAt)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

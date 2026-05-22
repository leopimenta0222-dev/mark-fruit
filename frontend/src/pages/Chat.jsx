import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import { resolveImage } from "../services/supabase.js";
import { getPost, getProfile, getMessages, sendMessage, subscribeMessages } from "../services/db.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Chat() {
  const { postId, otherUserId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    getPost(postId).then(setPost).catch(() => {});
    getProfile(otherUserId).then(setOtherUser).catch(() => {});
    getMessages(postId, user.id, otherUserId).then(setMessages).catch(() => {});
  }, [postId, otherUserId, user.id]);

  useEffect(() => {
    // Realtime do Supabase: ouve novas mensagens desta conversa
    const unsub = subscribeMessages(Number(postId), user.id, otherUserId, (msg) => {
      setMessages((m) => (m.some((x) => x.id === msg.id) ? m : [...m, msg]));
    });
    return unsub;
  }, [postId, otherUserId, user.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text.trim();
    setText("");
    try {
      const msg = await sendMessage(Number(postId), user.id, otherUserId, content);
      // adiciona logo (o realtime também chega, mas evitamos duplicar por id)
      setMessages((m) => (m.some((x) => x.id === msg.id) ? m : [...m, {
        id: msg.id, content: msg.content, senderId: msg.sender_id,
        receiverId: msg.receiver_id, createdAt: msg.created_at,
      }]));
    } catch (err) {
      console.error(err);
      setText(content);
    }
  }

  if (!post || !otherUser) return <div className="p-8 text-center text-stone-500">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="card flex flex-col h-[70vh]">
        <div className="p-4 border-b border-stone-100 dark:border-stone-700 flex items-center gap-3">
          <Link to="/chats" className="text-stone-500 dark:text-stone-400 hover:text-stone-700">
            <ArrowLeft/>
          </Link>
          <Link to={`/post/${post.id}`} className="flex items-center gap-3 flex-1">
            <img src={resolveImage(post.image)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
            <div>
              <p className="font-semibold dark:text-stone-100">{otherUser.name}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">Sobre: {post.title}</p>
            </div>
          </Link>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-stone-50 dark:bg-stone-900/50">
          {messages.length === 0 && (
            <p className="text-center text-stone-400 text-sm py-8">
              Comece a conversa enviando uma mensagem.
            </p>
          )}
          {messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] px-3.5 py-2 rounded-2xl ${
                    mine ? "bg-brand-600 text-white rounded-br-sm" : "bg-white dark:bg-stone-800 dark:text-stone-100 border border-stone-200 dark:border-stone-700 rounded-bl-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.content}</p>
                  <p className={`text-[10px] mt-1 ${mine ? "text-brand-100" : "text-stone-400"}`}>
                    {new Date(m.createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={send} className="p-3 border-t border-stone-100 dark:border-stone-700 flex gap-2">
          <input
            className="input"
            placeholder="Digite uma mensagem..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <button className="btn-primary !px-4" type="submit">
            <Send size={18}/>
          </button>
        </form>
      </div>
    </div>
  );
}

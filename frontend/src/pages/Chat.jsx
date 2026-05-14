import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Send, ArrowLeft } from "lucide-react";
import { io } from "socket.io-client";
import { api, API_BASE, resolveImage } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Chat() {
  const { postId, otherUserId } = useParams();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socketRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get(`/posts/${postId}`).then((r) => setPost(r.data)),
      api.get(`/users/${otherUserId}`).then((r) => setOtherUser(r.data)),
      api.get(`/posts/${postId}/messages/${otherUserId}`).then((r) => setMessages(r.data)),
    ]);
  }, [postId, otherUserId]);

  useEffect(() => {
    const token = localStorage.getItem("markfruit:token");
    // Em dev: API_BASE vazio -> conecta no mesmo host (proxy do Vite).
    // Em prod: conecta direto no backend do Render.
    const socket = API_BASE
      ? io(API_BASE, { auth: { token } })
      : io({ auth: { token } });
    socketRef.current = socket;
    socket.on("chat:message", (msg) => {
      const samePost = msg.postId === Number(postId);
      const sameChat =
        (msg.senderId === user.id && msg.receiverId === Number(otherUserId)) ||
        (msg.senderId === Number(otherUserId) && msg.receiverId === user.id);
      if (samePost && sameChat) {
        setMessages((m) => {
          if (m.some((x) => x.id === msg.id)) return m;
          return [...m, msg];
        });
      }
    });
    return () => socket.disconnect();
  }, [postId, otherUserId, user.id]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(e) {
    e.preventDefault();
    if (!text.trim()) return;
    socketRef.current.emit(
      "chat:send",
      { postId: Number(postId), receiverId: Number(otherUserId), content: text },
      (resp) => {
        if (resp?.error) console.error(resp.error);
      }
    );
    setText("");
  }

  if (!post || !otherUser) return <div className="p-8 text-center text-stone-500">Carregando...</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="card flex flex-col h-[70vh]">
        <div className="p-4 border-b border-stone-100 flex items-center gap-3">
          <Link to="/chats" className="text-stone-500 hover:text-stone-700">
            <ArrowLeft/>
          </Link>
          <Link to={`/post/${post.id}`} className="flex items-center gap-3 flex-1">
            <img src={resolveImage(post.image)} alt="" className="w-12 h-12 rounded-xl object-cover"/>
            <div>
              <p className="font-semibold">{otherUser.name}</p>
              <p className="text-xs text-stone-500">Sobre: {post.title}</p>
            </div>
          </Link>
        </div>

        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-stone-50">
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
                    mine ? "bg-brand-600 text-white rounded-br-sm" : "bg-white border border-stone-200 rounded-bl-sm"
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

        <form onSubmit={send} className="p-3 border-t border-stone-100 flex gap-2">
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

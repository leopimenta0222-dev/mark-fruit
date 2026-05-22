import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Profile from "./pages/Profile.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import NewPost from "./pages/NewPost.jsx";
import ComoPlantar from "./pages/ComoPlantar.jsx";
import Conversations from "./pages/Conversations.jsx";
import Chat from "./pages/Chat.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/como-plantar" element={<ComoPlantar />} />
          <Route path="/post/:id" element={<PostDetail />} />
          <Route path="/perfil" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/posts/novo" element={<PrivateRoute producerOnly><NewPost /></PrivateRoute>} />
          <Route path="/chats" element={<PrivateRoute><Conversations /></PrivateRoute>} />
          <Route path="/chat/:postId/:otherUserId" element={<PrivateRoute><Chat /></PrivateRoute>} />
          <Route path="*" element={<div className="p-8 text-center">Página não encontrada</div>} />
        </Routes>
      </main>
      <footer className="border-t border-stone-100 bg-white dark:bg-stone-900 dark:border-stone-800 py-6 text-center text-sm text-stone-500 dark:text-stone-400">
        Mark Fruit — TCC por Maria, Maria, Luiza e Yago
      </footer>
    </div>
  );
}

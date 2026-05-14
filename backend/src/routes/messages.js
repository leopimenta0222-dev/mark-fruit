import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Lista de conversas do usuário logado
router.get("/conversations", authRequired, async (req, res) => {
  const userId = req.user.id;
  const messages = await prisma.message.findMany({
    where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    include: {
      post: { select: { id: true, title: true, image: true } },
      sender: { select: { id: true, name: true, avatar: true } },
      receiver: { select: { id: true, name: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  // Agrupar por (postId, outraPessoa)
  const map = new Map();
  for (const m of messages) {
    const other = m.senderId === userId ? m.receiver : m.sender;
    const key = `${m.postId}-${other.id}`;
    if (!map.has(key)) {
      map.set(key, {
        postId: m.postId,
        post: m.post,
        otherUser: other,
        lastMessage: m,
      });
    }
  }
  res.json(Array.from(map.values()));
});

// Mensagens de uma conversa específica
router.get("/posts/:postId/messages/:otherUserId", authRequired, async (req, res) => {
  const userId = req.user.id;
  const postId = Number(req.params.postId);
  const otherUserId = Number(req.params.otherUserId);
  const messages = await prisma.message.findMany({
    where: {
      postId,
      OR: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
  // marca as recebidas como lidas
  await prisma.message.updateMany({
    where: { postId, senderId: otherUserId, receiverId: userId, read: false },
    data: { read: true },
  });
  res.json(messages);
});

// Enviar mensagem (também é enviada via socket, esta rota é fallback / persistência)
router.post("/posts/:postId/messages", authRequired, async (req, res) => {
  const userId = req.user.id;
  const postId = Number(req.params.postId);
  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    return res.status(400).json({ error: "receiverId e content são obrigatórios" });
  }
  const msg = await prisma.message.create({
    data: { postId, senderId: userId, receiverId: Number(receiverId), content },
  });
  res.status(201).json(msg);
});

export default router;

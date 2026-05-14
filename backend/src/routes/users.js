import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Perfil do usuário logado
router.get("/me", authRequired, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  const { password, ...safe } = user;
  res.json(safe);
});

// Atualizar perfil
router.put("/me", authRequired, async (req, res) => {
  const { name, phone, city, state, bio, avatar, latitude, longitude } = req.body;
  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: { name, phone, city, state, bio, avatar, latitude, longitude },
  });
  const { password, ...safe } = updated;
  res.json(safe);
});

// Perfil público
router.get("/:id", async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: {
      id: true, name: true, role: true, city: true, state: true,
      bio: true, avatar: true, createdAt: true,
      posts: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!user) return res.status(404).json({ error: "Usuário não encontrado" });
  res.json(user);
});

export default router;

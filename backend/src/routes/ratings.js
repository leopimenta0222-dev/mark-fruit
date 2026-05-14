import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";

const router = Router();

// Avaliar um post
router.post("/posts/:postId/ratings", authRequired, async (req, res) => {
  const postId = Number(req.params.postId);
  const { stars, comment } = req.body;
  if (!stars || stars < 1 || stars > 5) {
    return res.status(400).json({ error: "stars deve estar entre 1 e 5" });
  }
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return res.status(404).json({ error: "Post não encontrado" });
  if (post.authorId === req.user.id) {
    return res.status(400).json({ error: "Você não pode avaliar o próprio post" });
  }
  try {
    const rating = await prisma.rating.upsert({
      where: { postId_userId: { postId, userId: req.user.id } },
      create: { postId, userId: req.user.id, stars: Number(stars), comment },
      update: { stars: Number(stars), comment },
    });
    res.status(201).json(rating);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao avaliar" });
  }
});

router.delete("/posts/:postId/ratings", authRequired, async (req, res) => {
  const postId = Number(req.params.postId);
  await prisma.rating.deleteMany({ where: { postId, userId: req.user.id } });
  res.status(204).end();
});

export default router;

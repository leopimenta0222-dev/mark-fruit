import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { prisma } from "../lib/prisma.js";
import { authRequired, producerOnly } from "../middleware/auth.js";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error("Apenas imagens são permitidas"));
  },
});

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Listar posts (com busca, filtros, ordenação por melhor avaliação e proximidade)
router.get("/", async (req, res) => {
  const { q, category, isSeed, lat, lon, sort } = req.query;
  const where = {};
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
    ];
  }
  if (category) where.category = category;
  if (isSeed !== undefined) where.isSeed = isSeed === "true";

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { id: true, name: true, city: true, state: true, latitude: true, longitude: true } },
      ratings: { select: { stars: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = posts.map((p) => {
    const avg = p.ratings.length ? p.ratings.reduce((s, r) => s + r.stars, 0) / p.ratings.length : 0;
    let distanceKm = null;
    if (lat && lon && p.author.latitude != null && p.author.longitude != null) {
      distanceKm = haversine(Number(lat), Number(lon), p.author.latitude, p.author.longitude);
    }
    return { ...p, averageRating: avg, ratingCount: p.ratings.length, distanceKm };
  });

  if (sort === "rating") {
    enriched.sort((a, b) => b.averageRating - a.averageRating);
  } else if (sort === "nearest" && lat && lon) {
    enriched.sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
  } else if (sort === "best") {
    // mistura avaliação + proximidade
    enriched.sort((a, b) => {
      const scoreA = a.averageRating - (a.distanceKm ?? 0) * 0.01;
      const scoreB = b.averageRating - (b.distanceKm ?? 0) * 0.01;
      return scoreB - scoreA;
    });
  }

  res.json(enriched);
});

router.get("/:id", async (req, res) => {
  const post = await prisma.post.findUnique({
    where: { id: Number(req.params.id) },
    include: {
      author: { select: { id: true, name: true, city: true, state: true, avatar: true } },
      ratings: {
        include: { user: { select: { id: true, name: true, avatar: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!post) return res.status(404).json({ error: "Post não encontrado" });
  const avg = post.ratings.length
    ? post.ratings.reduce((s, r) => s + r.stars, 0) / post.ratings.length
    : 0;
  res.json({ ...post, averageRating: avg, ratingCount: post.ratings.length });
});

router.post("/", authRequired, producerOnly, upload.single("image"), async (req, res) => {
  try {
    const { title, description, price, category, isSeed, stock } = req.body;
    if (!title || !description || !price || !category) {
      return res.status(400).json({ error: "Campos obrigatórios: title, description, price, category" });
    }
    if (!req.file) return res.status(400).json({ error: "Imagem é obrigatória" });

    const post = await prisma.post.create({
      data: {
        title,
        description,
        price: Number(price),
        category,
        isSeed: isSeed === "true" || isSeed === true,
        stock: stock ? Number(stock) : 1,
        image: `/uploads/${req.file.filename}`,
        authorId: req.user.id,
      },
    });
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao criar post" });
  }
});

router.put("/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: "Post não encontrado" });
  if (post.authorId !== req.user.id) return res.status(403).json({ error: "Não autorizado" });

  const { title, description, price, category, stock } = req.body;
  const updated = await prisma.post.update({
    where: { id },
    data: {
      title, description, category,
      price: price != null ? Number(price) : undefined,
      stock: stock != null ? Number(stock) : undefined,
    },
  });
  res.json(updated);
});

router.delete("/:id", authRequired, async (req, res) => {
  const id = Number(req.params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return res.status(404).json({ error: "Post não encontrado" });
  if (post.authorId !== req.user.id) return res.status(403).json({ error: "Não autorizado" });
  await prisma.post.delete({ where: { id } });
  res.status(204).end();
});

export default router;

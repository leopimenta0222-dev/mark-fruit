import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role, phone, city, state } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "name, email, password e role são obrigatórios" });
    }
    if (!["CONSUMER", "PRODUCER"].includes(role)) {
      return res.status(400).json({ error: "role deve ser CONSUMER ou PRODUCER" });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ error: "Email já cadastrado" });

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hash, role, phone, city, state },
    });
    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    const { password: _, ...safe } = user;
    res.status(201).json({ user: safe, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao cadastrar" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email e password são obrigatórios" });
    }
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: "Credenciais inválidas" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Credenciais inválidas" });

    const token = jwt.sign(
      { id: user.id, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    const { password: _, ...safe } = user;
    res.json({ user: safe, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao fazer login" });
  }
});

export default router;

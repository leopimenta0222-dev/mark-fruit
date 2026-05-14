import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { Server as SocketServer } from "socket.io";
import jwt from "jsonwebtoken";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import postRoutes from "./routes/posts.js";
import ratingRoutes from "./routes/ratings.js";
import messageRoutes from "./routes/messages.js";
import botRoutes from "./routes/bot.js";
import { prisma } from "./lib/prisma.js";

// Origens liberadas no CORS. Em produção, defina FRONTEND_URL no Render
// (ex: https://mark-fruit.vercel.app). Aceita várias separadas por vírgula.
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: allowedOrigins.length ? allowedOrigins : "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
};

const app = express();
const server = http.createServer(app);
const io = new SocketServer(server, { cors: corsOptions });

app.use(cors(corsOptions));
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.get("/", (_, res) => res.json({ ok: true, service: "Mark Fruit API" }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", ratingRoutes);
app.use("/api", messageRoutes);
app.use("/api/bot", botRoutes);

// Socket.io — chat em tempo real
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Token ausente"));
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = payload;
    next();
  } catch {
    next(new Error("Token inválido"));
  }
});

io.on("connection", (socket) => {
  socket.join(`user:${socket.user.id}`);
  console.log(`✓ socket conectado: user ${socket.user.id}`);

  socket.on("chat:send", async ({ postId, receiverId, content }, ack) => {
    try {
      if (!postId || !receiverId || !content?.trim()) {
        return ack?.({ error: "Dados inválidos" });
      }
      const msg = await prisma.message.create({
        data: {
          postId: Number(postId),
          senderId: socket.user.id,
          receiverId: Number(receiverId),
          content: content.trim(),
        },
      });
      io.to(`user:${receiverId}`).emit("chat:message", msg);
      io.to(`user:${socket.user.id}`).emit("chat:message", msg);
      ack?.({ ok: true, message: msg });
    } catch (err) {
      console.error(err);
      ack?.({ error: "Erro ao enviar" });
    }
  });

  socket.on("disconnect", () => {
    console.log(`× socket desconectado: user ${socket.user.id}`);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🍅 Mark Fruit API rodando em http://localhost:${PORT}`);
});

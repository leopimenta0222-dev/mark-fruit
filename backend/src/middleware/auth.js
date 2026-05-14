import jwt from "jsonwebtoken";

export function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    return res.status(401).json({ error: "Token inválido" });
  }
}

export function producerOnly(req, res, next) {
  if (req.user?.role !== "PRODUCER") {
    return res.status(403).json({ error: "Apenas produtores podem fazer isso" });
  }
  next();
}

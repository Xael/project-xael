import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { Server } from "socket.io";
import http from "http";
import { PrismaClient } from "@prisma/client";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret";

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);
  const PORT = 3000;

  app.use(cors({
    origin: process.env.APP_URL || true,
    credentials: true,
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Request logger
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
  });

  // Socket.io connection
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    socket.on("disconnect", () => console.log("Client disconnected"));
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // --- AUTH ROUTES ---
  
  app.get("/api/auth/google/url", (req, res) => {
    try {
      if (!process.env.GOOGLE_CLIENT_ID) {
        throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables.");
      }
      const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`;
      console.log("Generating Google Auth URL with redirect:", redirectUri);
      const url = googleClient.generateAuthUrl({
        access_type: "offline",
        scope: ["https://www.googleapis.com/auth/userinfo.profile", "https://www.googleapis.com/auth/userinfo.email"],
        redirect_uri: redirectUri,
      });
      res.json({ url });
    } catch (error: any) {
      console.error("Error generating Google Auth URL:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/auth/callback", async (req, res) => {
    const { code } = req.query;
    try {
      if (!code) throw new Error("No code provided.");
      const redirectUri = `${process.env.APP_URL || 'http://localhost:3000'}/auth/callback`;
      const { tokens } = await googleClient.getToken({
        code: code as string,
        redirect_uri: redirectUri
      });
      const ticket = await googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload()!;
      
      let user = await prisma.user.upsert({
        where: { id: payload.sub },
        update: {
          displayName: payload.name || "Guest",
          avatarUrl: payload.picture,
        },
        create: {
          id: payload.sub,
          email: payload.email!,
          displayName: payload.name || "Guest",
          firstName: payload.given_name || "Guest",
          avatarUrl: payload.picture,
        },
      });

      const token = jwt.sign({ userId: user.id }, JWT_SECRET);
      
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // Changed for better local/env compatibility
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      });

      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: "AUTH_SUCCESS", user: ${JSON.stringify(user)} }, "*");
                window.close();
              } else {
                window.location.href = "/";
              }
            </script>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Auth callback error:", error.message);
      res.status(500).send(`Authentication failed: ${error.message}`);
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const token = req.cookies.auth_token;
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      
      const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      res.json(user);
    } catch (error: any) {
      console.error("API Auth Me error:", error.message);
      res.status(401).json({ error: "Unauthorized" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.clearCookie("auth_token");
    res.json({ success: true });
  });

  // --- DATA ROUTES ---

  app.get("/api/feed", async (req, res) => {
    const items = await prisma.historyItem.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });
    res.json(items);
  });

  app.post("/api/feed", async (req, res) => {
    const item = req.body;
    const newItem = await prisma.historyItem.create({
      data: item
    });
    io.emit("feed:item_added", newItem);
    res.json(newItem);
  });

  app.post("/api/feed/:id/vote", async (req, res) => {
    const { id } = req.params;
    const { delta } = req.body;
    const updated = await prisma.historyItem.update({
      where: { id },
      data: { votes: { increment: delta } }
    });
    io.emit("feed:item_updated", updated);
    res.json(updated);
  });

  app.post("/api/users/:userId/strikes", async (req, res) => {
    const { userId } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const newStrikes = user.strikes + 1;
    const isBanned = newStrikes >= 3;
    
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { strikes: newStrikes, isBanned }
    });
    res.json(updated);
  });

  app.post("/api/users/:userId/ban", async (req, res) => {
    const updated = await prisma.user.update({
      where: { id: req.params.userId },
      data: { isBanned: true }
    });
    res.json(updated);
  });

  app.delete("/api/feed", async (req, res) => {
    const { userId } = req.query;
    if (userId) {
      await prisma.historyItem.deleteMany({ where: { userId: userId as string } });
    } else {
      await prisma.historyItem.deleteMany({});
    }
    io.emit("feed:cleared", { userId });
    res.json({ success: true });
  });

  app.get("/api/users/:userId/projects", async (req, res) => {
    const items = await prisma.project.findMany({
      where: { userId: req.params.userId }
    });
    res.json(items);
  });

  app.post("/api/users/:userId/projects", async (req, res) => {
    const item = await prisma.project.create({
      data: { ...req.body, userId: req.params.userId }
    });
    res.json(item);
  });

  app.patch("/api/users/:userId/settings", async (req, res) => {
    const user = await prisma.user.update({
      where: { id: req.params.userId },
      data: { settings: req.body }
    });
    res.json(user);
  });

  // Vite/Static serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // Safety check: Don't serve index.html for missing /api routes
    app.all("/api/*", (req, res) => {
      res.status(404).json({ error: `Route ${req.method} ${req.url} not found on server.` });
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

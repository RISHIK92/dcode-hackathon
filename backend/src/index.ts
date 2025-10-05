import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/authRouter.js";
import projectRoutes from "./routes/projectRouter.js";
import sessionRoutes from "./routes/sessionRouter.js";

import { WebSocketServer, WebSocket } from "ws";

dotenv.config();

const app = express();
const PORT = 4000;

app.use(express.json());
app.use(cors());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sessions", sessionRoutes);

const WS_PORT = 3001;
const wss = new WebSocketServer({ port: WS_PORT });

const clients = new Map<string, { bridge?: WebSocket; browser?: WebSocket }>();
wss.on("connection", (ws) => {
  console.log(
    `Signaling server: Client connected to WebSocket on port ${WS_PORT}.`
  );
  ws.on("message", (message) => {
    const data = JSON.parse(message.toString());
    const { type, projectId, role } = data;
    if (type === "join") {
      if (!clients.has(projectId)) clients.set(projectId, {});
      const session = clients.get(projectId)!;
      session[role as "browser" | "bridge"] = ws;
      console.log(`Client joined project ${projectId} as ${role}`);
    } else {
      const session = clients.get(projectId);
      if (!session) return;
      const recipient =
        ws === session.browser ? session.bridge : session.browser;
      if (recipient && recipient.readyState === 1) {
        recipient.send(message.toString());
      }
    }
  });
  // Remember to add cleanup logic for ws.on('close')
});

console.log(
  `🚀 WebSocket Signaling Server running on ws://localhost:${WS_PORT}`
);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

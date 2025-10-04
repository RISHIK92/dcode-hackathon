import express from "express";
import cors from "cors";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import authRoutes from "./routes/authRouter";
import projectRoutes from "./routes/projectRouter";
import sessionRoutes from "./routes/sessionRouter";
const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sessions", sessionRoutes);
const clients = new Map();
wss.on("connection", (ws) => {
    console.log("Signaling server: Client connected.");
    ws.on("message", (message) => {
        const data = JSON.parse(message.toString());
        const { type, projectId, role } = data;
        if (type === "join") {
            if (!clients.has(projectId))
                clients.set(projectId, {});
            const session = clients.get(projectId);
            //@ts-ignore
            session[role] = ws;
            console.log(`Client joined project ${projectId} as ${role}`);
        }
        else {
            const session = clients.get(projectId);
            if (!session)
                return;
            const recipient = ws === session.browser ? session.bridge : session.browser;
            if (recipient && recipient.readyState === 1) {
                recipient.send(message.toString());
            }
        }
    });
    // Add cleanup logic for ws.on('close') in a real app
});
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Backend and Signaling Server running on http://localhost:${PORT}`);
});

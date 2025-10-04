import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import healthRoutes from "./routes/health.js";
import authRoutes from "./routes/authRouter.js";
import projectRoutes from "./routes/projectRouter.js";
import sessionRoutes from "./routes/sessionRouter.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/sessions", sessionRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

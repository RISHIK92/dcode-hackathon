import { Router } from "express";
import { protect } from "../middleware/middleware.js";
import { runProjectSession, stopProjectSession, } from "../controllers/sessionController.js";
const router = Router();
router.use(protect);
router.post("/:projectId/run", runProjectSession);
router.post("/:projectId/stop", stopProjectSession);
export default router;

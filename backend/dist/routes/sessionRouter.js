import { Router } from "express";
import { protect } from "../middleware/middleware";
import { runProjectSession, stopProjectSession, } from "../controllers/sessionController";
const router = Router();
router.use(protect);
router.post("/:projectId/run", runProjectSession);
router.post("/:projectId/stop", stopProjectSession);
export default router;

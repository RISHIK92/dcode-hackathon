import { Router } from "express";
import { protect } from "../middleware/middleware";
import {
  createFile,
  updateFileContent,
  deleteFile,
} from "../controllers/fileController";

// We merge params to get :projectId from the parent router
const router = Router({ mergeParams: true });

router.use(protect);

router.post("/", createFile);
router.put("/:fileId", updateFileContent);
router.delete("/:fileId", deleteFile);

export default router;

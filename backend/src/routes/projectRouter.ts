import { Router } from "express";
import { protect } from "../middleware/middleware.js";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProjectName,
  deleteProject,
} from "../controllers/projectController.js";
import fileRoutes from "./fileRouter.js";

const router = Router();

router.use(protect);

router.route("/").post(createProject).get(getProjects);

router
  .route("/:id")
  .get(getProjectById)
  .put(updateProjectName)
  .delete(deleteProject);

router.use("/:projectId/files", fileRoutes);

export default router;

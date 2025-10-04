import { Router } from "express";
import { protect } from "../middleware/middleware";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProjectName,
  deleteProject,
} from "../controllers/projectController";

const router = Router();

router.use(protect);

router.route("/").post(createProject).get(getProjects);

router
  .route("/:id")
  .get(getProjectById)
  .put(updateProjectName)
  .delete(deleteProject);

export default router;

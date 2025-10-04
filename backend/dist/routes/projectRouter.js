import { Router } from "express";
import { protect } from "../middleware/middleware";
import { createProject, getProjects, getProjectById, updateProjectName, deleteProject, updateProjectCode, } from "../controllers/projectController";
import fileRoutes from "./fileRouter";
const router = Router();
router.use(protect);
router.route("/").post(createProject).get(getProjects);
router
    .route("/:id")
    .get(getProjectById)
    .put(updateProjectName)
    .delete(deleteProject);
router.put("/:id/code", updateProjectCode);
router.use("/:projectId/files", fileRoutes);
export default router;

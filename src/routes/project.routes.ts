import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} from "../controllers/project.controller";
import { protect } from "../middleware/auth.middleware";
import { isMember, isOwnerOrAdmin } from "../middleware/role.middleware";
import taskRoutes from "./task.routes";

const router = Router({ mergeParams: true });

router.use(protect);

router
  .route("/")
  .get(isMember, getProjects)
  .post(isOwnerOrAdmin, createProject);

router
  .route("/:projectId")
  .get(isMember, getProject)
  .patch(isOwnerOrAdmin, updateProject)
  .delete(isOwnerOrAdmin, deleteProject);

router.use("/:projectId/task", taskRoutes);

export default router;

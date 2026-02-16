import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject
} from "../controllers/project.controller";
import { protect } from "../middleware/auth.middleware";
import { isMember, isOwner } from "../middleware/role.middleware";

const router = Router({ mergeParams: true });

router.use(protect);

router.route("/").get(isMember, getProjects).post(isOwner, createProject);

router
  .route("/:projectId")
  .get(isMember, getProject)
  .patch(isOwner, updateProject)
  .delete(isOwner, deleteProject);

export default router;

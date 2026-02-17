import { Router } from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTask
} from "../controllers/task.controller";
import { protect } from "../middleware/auth.middleware";
import { isMember } from "../middleware/role.middleware";
import commentRouter from "./comment.routes";

const router = Router({ mergeParams: true });

router.use(protect);
router.use(isMember);

router.route("/").get(getTasks).post(createTask);

router.route("/:taskId").get(getTask).patch(updateTask).delete(deleteTask);

router.use("/:taskId/comment", commentRouter);

export default router;

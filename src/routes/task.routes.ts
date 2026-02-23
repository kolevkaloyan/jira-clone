import { Router } from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTask,
  transitionTask
} from "../controllers/task.controller";
import { protect } from "../middleware/auth.middleware";
import { isMember } from "../middleware/role.middleware";
import commentRouter from "./comment.routes";
import tagRouter from "./tag.routes";
import { requestContextMiddleware } from "../middleware/requestContext.middleware";

const router = Router({ mergeParams: true });

router.use(protect);

router.use(requestContextMiddleware);

router.use(isMember);

router.route("/").get(getTasks).post(createTask);

router.route("/:taskId").get(getTask).patch(updateTask).delete(deleteTask);

router.patch("/:taskId/transition", isMember, transitionTask);

router.use("/:taskId/comment", commentRouter);

router.use("/:taskId/tag", tagRouter);

export default router;

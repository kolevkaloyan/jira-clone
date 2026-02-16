import { Router } from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} from "../controllers/task.controller";
import { protect } from "../middleware/auth.middleware";
import { isMember } from "../middleware/role.middleware";

const router = Router({ mergeParams: true });

router.use(protect);
router.use(isMember);

router.route("/").get(getTasks).post(createTask);

router.route("/:taskId").patch(updateTask).delete(deleteTask);

export default router;

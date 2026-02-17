import { Router } from "express";
import {
  getComments,
  createComment,
  deleteComment
} from "../controllers/comment.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router({ mergeParams: true });

router.use(protect);

router.route("/").get(getComments).post(createComment);

router.route("/:commentId").delete(deleteComment);

export default router;

import { Router } from "express";
import { attachTag, createTag, detachTag } from "../controllers/tag.controller";
import { protect } from "../middleware/auth.middleware";
import { isMember } from "../middleware/role.middleware";

const router = Router({ mergeParams: true });

router.use(protect, isMember);

router.route("/:tagId").post(attachTag).delete(detachTag);

export default router;

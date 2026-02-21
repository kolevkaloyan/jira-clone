import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  acceptInvite,
  create,
  getOrgs,
  inviteUser
} from "../controllers/organization.controller";
import { isMember, isOwnerOrAdmin } from "../middleware/role.middleware";
import projectRouter from "./project.routes";
import { getOrgTags, createTag } from "../controllers/tag.controller";

const router = Router();

router.post("/", protect, create);

router.get("/", protect, getOrgs);

router.post("/:orgId/invite", protect, isOwnerOrAdmin, inviteUser);

router.post("/accept-invite/:token", acceptInvite);

router.use("/:orgId/project", projectRouter);

router
  .route("/:orgId/tag")
  .get(protect, isMember, getOrgTags)
  .post(protect, isMember, createTag);

export default router;

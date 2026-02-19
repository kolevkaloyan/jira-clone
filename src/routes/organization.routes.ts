import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  create,
  getMyInvitations,
  getOrgs,
  inviteUser,
  respondToInvitation
} from "../controllers/organization.controller";
import { isMember, isOwner } from "../middleware/role.middleware";
import projectRouter from "./project.routes";
import { getOrgTags, createTag } from "../controllers/tag.controller";
import { requestContextMiddleware } from "../middleware/requestContext.middleware";

const router = Router();

router.use(protect);

router.use(requestContextMiddleware);

router.post("/", create);

router.get("/", getOrgs);

router.get("/invitations", getMyInvitations);

router.post("/:orgId/invite", isOwner, inviteUser);

router.patch("/invitations/:membershipId", respondToInvitation);

router.use("/:orgId/project", projectRouter);

router
  .route("/:orgId/tag")
  .get(protect, isMember, getOrgTags)
  .post(protect, isMember, createTag);

export default router;

import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import {
  create,
  getMyInvitations,
  getOrgs,
  inviteUser,
  respondToInvitation
} from "../controllers/organization.controller";
import { isOwner } from "../middleware/role.middleware";

const router = Router();

router.use(protect);

router.post("/", create);

router.get("/", getOrgs);

router.get("/invitations", getMyInvitations);

router.post("/:orgId/invite", isOwner, inviteUser);

router.patch("/invitations/:membershipId", respondToInvitation);

export default router;

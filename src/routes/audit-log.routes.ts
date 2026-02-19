import { Router } from "express";
import { protect } from "../middleware/auth.middleware";
import { getHistory } from "../controllers/audit-log.controller";

const router = Router();

router.use(protect);

router.get("/", getHistory);

export default router;

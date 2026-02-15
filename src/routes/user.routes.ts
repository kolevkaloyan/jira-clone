import { Router } from "express";
import { getMe, updateMe } from "../controllers/user.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.use(protect); //auth guard

router.get("/me", getMe);

router.patch("/update-me", updateMe);

export default router;

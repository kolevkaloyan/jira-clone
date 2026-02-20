import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshTokens
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";

const router = Router();

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", protect, logout);

router.post("/refreshTokens", protect, refreshTokens);

export default router;

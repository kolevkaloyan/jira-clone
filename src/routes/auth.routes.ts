import { Router } from "express";
import {
  signup,
  login,
  logout,
  refreshTokens
} from "../controllers/auth.controller";
import { protect } from "../middleware/auth.middleware";
import {
  signupLimiter,
  loginLimiter,
  refreshLimiter
} from "../middleware/rateLimiter";

const router = Router();

router.post("/signup", signupLimiter, signup);

router.post("/login", loginLimiter, login);

router.post("/logout", protect, logout);

router.post("/refreshTokens", refreshLimiter, protect, refreshTokens);

export default router;

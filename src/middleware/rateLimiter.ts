import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import { redis } from "../redis/redis-client";

const createLimiter = (windowMinutes: number, max: number, message: string) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    message: { status: "error", message },
    standardHeaders: true,
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: (...args: string[]) =>
        redis.call(args[0], ...args.slice(1)) as any
    })
  });

export const loginLimiter = createLimiter(
  15,
  5,
  "Too many login attempts, please try again in 15 minutes"
);

export const signupLimiter = createLimiter(
  60,
  3,
  "Too many accounts created from this IP, please try again later"
);

export const refreshLimiter = createLimiter(
  15,
  10,
  "Too many token refresh attempts, please try again later"
);

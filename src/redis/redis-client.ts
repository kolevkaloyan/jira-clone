import Redis from "ioredis";
import { requireEnv } from "../utils/requireEnv";

export const redis = new Redis({
  host: requireEnv("REDIS_HOST"),
  port: Number(requireEnv("REDIS_PORT"))
  // password: requireEnv("REDIS_PASSWORD")
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

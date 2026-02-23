import { Queue } from "bullmq";
import { requireEnv } from "../utils/requireEnv";

const connection = {
  host: requireEnv("REDIS_HOST"),
  port: Number(requireEnv("REDIS_PORT"))
};

export const digestQueue = new Queue("daily-digest", { connection });
export const cleanupQueue = new Queue("cleanup", { connection });

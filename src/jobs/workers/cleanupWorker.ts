import { Worker } from "bullmq";
import { redis } from "../../redis/redis-client";
import { requireEnv } from "../../utils/requireEnv";

const connection = {
  host: requireEnv("REDIS_HOST"),
  port: Number(requireEnv("REDIS_PORT"))
};

export const cleanupWorker = new Worker(
  "cleanup",
  async (job) => {
    console.log(`[cleanup] Running cleanup job #${job.id}`);

    const inviteKeys = await redis.keys("inviteToken:*");
    console.log(`[cleanup] Found ${inviteKeys.length} active invite tokens`);

    const refreshKeys = await redis.keys("refreshToken:*");
    console.log(`[cleanup] Found ${refreshKeys.length} active refresh tokens`);

    const { AppDataSource } = await import("../../data-source");
    const { User } = await import("../../entities/User");

    const userRepo = AppDataSource.getRepository(User);
    const provisionalUsers = await userRepo.find({
      where: { isActive: false }
    });

    let cleaned = 0;
    for (const user of provisionalUsers) {
      const keys = await redis.keys("inviteToken:*");

      let hasActiveInvite = false;
      for (const key of keys) {
        const storedEmail = await redis.get(key);
        if (storedEmail === user.email) {
          hasActiveInvite = true;
          break;
        }
      }

      if (!hasActiveInvite) {
        await userRepo.remove(user);
        cleaned++;
        console.log(
          `[cleanup] Removed expired provisional user: ${user.email}`
        );
      }
    }

    console.log(`[cleanup] Cleaned up ${cleaned} expired provisional accounts`);
  },
  { connection }
);

cleanupWorker.on("completed", (job) =>
  console.log(`[cleanup] Job ${job.id} completed`)
);
cleanupWorker.on("failed", (job, err) =>
  console.error(`[cleanup] Job ${job?.id} failed:`, err)
);

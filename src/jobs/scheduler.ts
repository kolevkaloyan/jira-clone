import { cleanupQueue, digestQueue } from "./queue";

export const startScheduler = async () => {
  await digestQueue.add(
    "send-daily-digest",
    {},
    {
      repeat: { pattern: "0 8 * * *" },
      removeOnComplete: true,
      removeOnFail: 10
    }
  );

  await cleanupQueue.add(
    "cleanup-expired",
    {},
    {
      repeat: { pattern: "0 * * * *" },
      removeOnComplete: true,
      removeOnFail: 10
    }
  );

  console.log("Scheduler started — jobs registered");
};

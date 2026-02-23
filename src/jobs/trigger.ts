import "dotenv/config";

import { cleanupQueue, digestQueue } from "./queue";

const trigger = async () => {
  await digestQueue.add("manual-daily-digest", {});
  console.log("Digest job added to queue");

  await cleanupQueue.add("manual-cleanup", {});
  console.log("Cleanup job added to the queue");

  process.exit(0);
};

trigger();

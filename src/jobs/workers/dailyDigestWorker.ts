import { Worker } from "bullmq";
import { AppDataSource } from "../../data-source";
import { User } from "../../entities/User";
import { Task, TaskStatus } from "../../entities/Task";
import { requireEnv } from "../../utils/requireEnv";

const connection = {
  host: requireEnv("REDIS_HOST"),
  port: Number(requireEnv("REDIS_PORT"))
};

export const digestWorker = new Worker(
  "daily-digest",
  async (job) => {
    console.log(`Running daily digest job #${job.id}`);

    const userRepo = AppDataSource.getRepository(User);
    const taskRepo = AppDataSource.getRepository(Task);

    const users = await userRepo.find({ where: { isActive: true } });

    for (const user of users) {
      const tasks = await taskRepo.find({
        where: [
          { assignee: { id: user.id }, status: TaskStatus.TODO },
          { assignee: { id: user.id }, status: TaskStatus.IN_PROGRESS },
          { assignee: { id: user.id }, status: TaskStatus.REVIEW }
        ],
        relations: ["project"]
      });

      if (tasks.length === 0) continue;

      //In production an actual email will be sent
      console.log(`Sending digest to ${user.email}:`);
      tasks.forEach((t) =>
        console.log(`[${t.status.toUpperCase()}] ${t.key}: ${t.title}`)
      );
    }

    console.log(`Digest sent to ${users.length} users`);
  },
  { connection }
);

digestWorker.on("completed", (job) =>
  console.log(`Daily Digest Job ${job.id} completed`)
);
digestWorker.on("failed", (job, err) =>
  console.error(`Daily Digest Job ${job?.id} failed:`, err)
);

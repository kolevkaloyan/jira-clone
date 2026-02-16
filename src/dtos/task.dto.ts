import { z } from "zod";
import { TaskStatus } from "../entities/Task";

export const CreateTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(TaskStatus).default(TaskStatus.TODO),
  assigneeId: z.uuid().optional()
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(TaskStatus).optional(),
  assigneeId: z.uuid().optional(),
  order: z.number().optional()
});

export const TaskParamsSchema = z.object({
  orgId: z.string().uuid(),
  projectId: z.string().uuid(),
  taskId: z.string().uuid().optional()
});

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>;
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>;

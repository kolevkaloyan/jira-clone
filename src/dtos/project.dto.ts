import { z } from "zod";
import { TaskStatus } from "../entities/Task";

export const CreateTaskInlineSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(TaskStatus).optional().default(TaskStatus.TODO)
});

export const CreateProjectSchema = z.object({
  name: z.string().min(1),
  key: z.string().min(1).max(10),
  description: z.string().optional(),
  initialTasks: z.array(CreateTaskInlineSchema).optional().default([])
});

export const UpdateProjectSchema = z.object({
  name: z.string().min(3).max(50).optional(),
  description: z.string().max(255).optional()
});

export const ParamsSchema = z.object({
  orgId: z.uuid(),
  projectId: z.uuid().optional()
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10)
});

export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;
export type UpdateProjectDto = z.infer<typeof UpdateProjectSchema>;
export type CreateProjectDto = z.infer<typeof CreateProjectSchema>;

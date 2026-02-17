import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z.string().min(1).max(20).trim(),
  color: z.string()
});

export const TagParamsSchema = z.object({
  orgId: z.uuid().optional(),
  taskId: z.uuid().optional(),
  tagId: z.uuid().optional()
});

export type CreateTagDto = z.infer<typeof CreateTagSchema>;

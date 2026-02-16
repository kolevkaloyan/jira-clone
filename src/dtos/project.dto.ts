import { z } from "zod";

export const CreateProjectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(50),
  key: z
    .string()
    .min(2, "Key must be at least 2 characters")
    .max(10, "Key must be at most 10 characters")
    .regex(/^[A-Z0-9]+$/, "Key must be alphanumeric and uppercase"),
  description: z.string().max(255).optional()
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

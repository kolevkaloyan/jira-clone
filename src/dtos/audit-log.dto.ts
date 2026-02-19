import { z } from "zod";

export const getAuditLogsSchema = z.object({
  query: z.object({
    entityName: z.string().optional(),
    entityId: z.uuid().optional(),
    userId: z.uuid().optional(),
    action: z.enum(["INSERT", "UPDATE", "DELETE"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    page: z.coerce.number().int().min(1).default(1)
  })
});

export type GetAuditLogsQuery = z.infer<typeof getAuditLogsSchema>["query"];

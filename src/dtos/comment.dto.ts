import { z } from "zod";

export const CreateCommentSchema = z.object({
  content: z.string().min(1).max(2000)
});

export const CommentParamsSchema = z.object({
  taskId: z.uuid(),
  commentId: z.uuid().optional()
});

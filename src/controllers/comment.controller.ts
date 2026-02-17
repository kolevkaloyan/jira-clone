import { CommentParamsSchema, CreateCommentSchema } from "../dtos/comment.dto";
import { CommentService } from "../services/comment.service";
import { catchAsync } from "../utils/catchAsync";
import { Request, Response } from "express";

const commentService = new CommentService();

export const createComment = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = CommentParamsSchema.parse(req.params);
  const { content } = CreateCommentSchema.parse(req.body);
  const userId = req.user.id;

  const comment = await commentService.addComment(taskId, userId, content);

  res.status(201).json({ status: "success", data: { comment } });
});

export const getComments = catchAsync(async (req: Request, res: Response) => {
  const { taskId } = CommentParamsSchema.parse(req.params);
  const comments = await commentService.getTaskComments(taskId);
  res.status(200).json({ status: "success", data: { comments } });
});

export const deleteComment = catchAsync(async (req: Request, res: Response) => {
  const { commentId } = CommentParamsSchema.parse(req.params);
  const userId = req.user.id;

  await commentService.deleteComment(commentId!, userId);
  res.json({
    status: "success",
    message: "Comment deleted successfully."
  });
});

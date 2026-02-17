import { TagService } from "../services/tag.service";
import { catchAsync } from "../utils/catchAsync";
import { Request, Response } from "express";

import { CreateTagSchema, TagParamsSchema } from "../dtos/tag.dto";

const tagService = new TagService();

export const createTag = catchAsync(async (req: Request, res: Response) => {
  const { orgId } = TagParamsSchema.parse(req.params);
  const { name, color } = CreateTagSchema.parse(req.body);

  const tag = await tagService.createTag(orgId!, name, color);

  res.status(201).json({
    status: "success",
    data: { tag }
  });
});

export const attachTag = catchAsync(async (req: Request, res: Response) => {
  const { taskId, tagId } = TagParamsSchema.parse(req.params);

  await tagService.attachToTask(taskId!, tagId!);

  res.status(200).json({
    status: "success",
    message: "Tag attached successfully"
  });
});

export const detachTag = catchAsync(async (req: Request, res: Response) => {
  const { taskId, tagId } = TagParamsSchema.parse(req.params);

  await tagService.detachFromTask(taskId!, tagId!);

  res.status(200).json({
    status: "success",
    message: "Tag detached successfully"
  });
});

export const getOrgTags = catchAsync(async (req: Request, res: Response) => {
  const { orgId } = TagParamsSchema.parse(req.params);
  const tags = await tagService.getOrgTags(orgId!);

  res.status(200).json({
    status: "success",
    data: { tags }
  });
});

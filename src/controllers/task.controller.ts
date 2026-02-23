import { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import { catchAsync } from "../utils/catchAsync";
import {
  CreateTaskSchema,
  TaskParamsSchema,
  UpdateTaskSchema
} from "../dtos/task.dto";
import { PaginationQuerySchema } from "../dtos/pagination.dto";
import { AppError } from "../utils/AppError";

const taskService = new TaskService();

export const createTask = catchAsync(async (req: Request, res: Response) => {
  const { orgId, projectId } = TaskParamsSchema.parse(req.params);
  const validatedData = CreateTaskSchema.parse(req.body);

  const task = await taskService.createTask(orgId, projectId, validatedData);

  res.status(201).json({
    status: "success",
    data: { task }
  });
});

export const getTasks = catchAsync(async (req: Request, res: Response) => {
  const { projectId } = TaskParamsSchema.parse(req.params);
  const { page, limit } = PaginationQuerySchema.parse(req.query);
  const status = req.query.status as any;

  const result = await taskService.listTasks(projectId, page, limit, status);

  res.status(200).json({
    status: "success",
    data: result
  });
});

export const getTask = catchAsync(async (req: Request, res: Response) => {
  const { projectId, taskId } = TaskParamsSchema.parse(req.params);

  const task = await taskService.getTaskById(projectId, taskId!);

  res.status(200).json({
    status: "success",
    data: { task }
  });
});

export const updateTask = catchAsync(async (req: Request, res: Response) => {
  const { projectId, taskId } = TaskParamsSchema.parse(req.params);
  const validatedData = UpdateTaskSchema.parse(req.body);

  const task = await taskService.updateTask(projectId, taskId!, validatedData);

  res.status(200).json({
    status: "success",
    data: { task }
  });
});

export const transitionTask = catchAsync(
  async (req: Request, res: Response) => {
    const { projectId, taskId } = TaskParamsSchema.parse(req.params);
    const { status } = req.body;

    if (!status) throw new AppError("Status is required", 400);

    const task = await taskService.transitionStatus(
      projectId,
      taskId as string,
      status
    );

    res.status(200).json({ status: "success", data: { task } });
  }
);

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { projectId, taskId } = TaskParamsSchema.parse(req.params);

  await taskService.deleteTask(projectId, taskId!);

  res.status(204).json({
    status: "success",
    message: "Task deleted"
  });
});

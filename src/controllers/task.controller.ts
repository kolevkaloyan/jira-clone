import { Request, Response } from "express";
import { TaskService } from "../services/task.service";
import { catchAsync } from "../utils/catchAsync";
import {
  CreateTaskSchema,
  TaskParamsSchema,
  UpdateTaskSchema
} from "../dtos/task.dto";

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
  const status = req.query.status as any;

  const tasks = await taskService.listTasks(projectId, status);

  res.status(200).json({
    status: "success",
    results: tasks.length,
    data: { tasks }
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

export const deleteTask = catchAsync(async (req: Request, res: Response) => {
  const { projectId, taskId } = TaskParamsSchema.parse(req.params);

  await taskService.deleteTask(projectId, taskId!);

  res.status(204).json({
    status: "success",
    data: null
  });
});

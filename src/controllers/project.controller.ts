import { Request, Response } from "express";
import { ProjectService } from "../services/project.service";
import { catchAsync } from "../utils/catchAsync";
import {
  CreateProjectSchema,
  PaginationQuerySchema,
  ParamsSchema,
  UpdateProjectSchema
} from "../dtos/project.dto";

const projectService = new ProjectService();

export const createProject = catchAsync(async (req: Request, res: Response) => {
  const { orgId } = ParamsSchema.parse(req.params);

  const validatedData = CreateProjectSchema.parse(req.body);
  const project = await projectService.createProject(orgId, validatedData);
  res.status(201).json({ status: "success", data: { project } });
});

export const getProjects = catchAsync(async (req: Request, res: Response) => {
  const { orgId } = ParamsSchema.parse(req.params);
  const { page, limit } = PaginationQuerySchema.parse(req.query);

  const result = await projectService.listProjects(orgId, page, limit);

  res.status(200).json({
    status: "success",
    data: result
  });
});

export const getProject = catchAsync(async (req: Request, res: Response) => {
  const { orgId, projectId } = ParamsSchema.parse(req.params);

  const project = await projectService.getProjectById(
    orgId,
    projectId as string
  );
  res.status(200).json({ status: "success", data: { project } });
});

export const updateProject = catchAsync(async (req: Request, res: Response) => {
  const { orgId, projectId } = ParamsSchema.parse(req.params);

  const validatedData = UpdateProjectSchema.parse(req.body);
  const project = await projectService.updateProject(
    orgId,
    projectId as string,
    validatedData
  );
  res.status(200).json({ status: "success", data: { project } });
});

export const deleteProject = catchAsync(async (req: Request, res: Response) => {
  const { orgId, projectId } = ParamsSchema.parse(req.params);

  await projectService.deleteProject(orgId, projectId as string);
  res.status(200).json({ status: "success", message: "Project deleted" });
});

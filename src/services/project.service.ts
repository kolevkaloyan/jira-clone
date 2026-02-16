import { AppDataSource } from "../data-source";
import { CreateProjectDto, UpdateProjectDto } from "../dtos/project.dto";
import { Project } from "../entities/Project";
import { AppError } from "../utils/AppError";

export class ProjectService {
  private projectRepo = AppDataSource.getRepository(Project);

  async createProject(orgId: string, data: CreateProjectDto) {
    if (!data.key) {
      throw new AppError("Project key is required", 400);
    }

    const formattedKey = data.key.toUpperCase().trim();

    const existingKey = await this.projectRepo.findOne({
      where: {
        key: formattedKey,
        organization: { id: orgId }
      }
    });

    if (existingKey) {
      throw new AppError(
        `Project key "${formattedKey}" is already in use in this organization`,
        400
      );
    }

    const newProject = this.projectRepo.create({
      ...data,
      key: formattedKey,
      organization: { id: orgId } as any
    });

    return await this.projectRepo.save(newProject);
  }

  async updateProject(
    orgId: string,
    projectId: string,
    data: UpdateProjectDto
  ) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, organization: { id: orgId } }
    });

    if (!project) {
      throw new AppError("Project not found in this organization", 404);
    }

    Object.assign(project, data);

    return await this.projectRepo.save(project);
  }

  async listProjects(orgId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const [items, total] = await this.projectRepo.findAndCount({
      where: { organization: { id: orgId } },
      order: { createdAt: "DESC" },
      take: limit,
      skip: skip
    });

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProjectById(orgId: string, projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, organization: { id: orgId } }
      //add relations: ["tasks"] when tasks are done
    });

    if (!project) {
      throw new AppError("Project not found", 404);
    }

    return project;
  }

  async deleteProject(orgId: string, projectId: string) {
    const project = await this.projectRepo.findOne({
      where: { id: projectId, organization: { id: orgId } }
    });

    if (!project) {
      throw new AppError("Project not found in this organization", 404);
    }

    await this.projectRepo.remove(project);

    return { message: "Project and all associated data deleted successfully" };
  }
}

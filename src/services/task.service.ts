import { AppDataSource } from "../data-source";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { Project } from "../entities/Project";
import { Task, TaskStatus } from "../entities/Task";
import { AppError } from "../utils/AppError";

export class TaskService {
  private taskRepo = AppDataSource.getRepository(Task);

  async createTask(orgId: string, projectId: string, data: CreateTaskDto) {
    return await AppDataSource.transaction(async (manager) => {
      const project = await manager.findOne(Project, {
        where: { id: projectId, organization: { id: orgId } },
        //lock the row for update to prevent race conditions
        lock: { mode: "pessimistic_write" }
      });

      if (!project) throw new AppError("Project not found", 404);

      project.lastTaskNumber += 1;
      await manager.save(project);

      const task = manager.create(Task, {
        ...data,
        project: { id: project.id } as any,
        taskNumber: project.lastTaskNumber,
        key: `${project.key}-${project.lastTaskNumber}`,
        assignee: data.assigneeId ? ({ id: data.assigneeId } as any) : null
      });

      return await manager.save(task);
    });
  }

  async getTaskById(projectId: string, taskId: string) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, project: { id: projectId } },
      loadRelationIds: true
    });

    if (!task) {
      throw new AppError("Task not found", 404);
    }

    return task;
  }

  async updateTask(projectId: string, taskId: string, data: UpdateTaskDto) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, project: { id: projectId } }
    });

    if (!task) throw new AppError("Task not found", 404);

    Object.assign(task, data);
    if (data.assigneeId) task.assignee = { id: data.assigneeId } as any;

    return await this.taskRepo.save(task);
  }

  async listTasks(projectId: string, status?: TaskStatus) {
    return await this.taskRepo.find({
      where: { project: { id: projectId }, status },
      order: { order: "ASC", createdAt: "DESC" },
      relations: ["tags"]
    });
  }

  async deleteTask(projectId: string, taskId: string) {
    const result = await this.taskRepo.delete({
      id: taskId,
      project: { id: projectId }
    });
    if (result.affected === 0) throw new AppError("Task not found", 404);
    return true;
  }
}

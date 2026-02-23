import { EntityManager } from "typeorm";
import { AppDataSource } from "../data-source";
import { CreateTaskDto, UpdateTaskDto } from "../dtos/task.dto";
import { Project } from "../entities/Project";
import { Task, TaskStatus } from "../entities/Task";
import { AppError } from "../utils/AppError";

const VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
  [TaskStatus.IN_PROGRESS]: [TaskStatus.REVIEW, TaskStatus.TODO],
  [TaskStatus.REVIEW]: [TaskStatus.DONE, TaskStatus.IN_PROGRESS],
  [TaskStatus.DONE]: [TaskStatus.TODO] // reopen
};

export class TaskService {
  private taskRepo = AppDataSource.getRepository(Task);

  async createTask(
    orgId: string,
    projectId: string,
    data: CreateTaskDto,
    transaction?: EntityManager
  ) {
    const manager = transaction ?? AppDataSource.manager;

    const runCreate = async (manager: EntityManager) => {
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
    };

    if (transaction) {
      return runCreate(transaction);
    }

    return AppDataSource.transaction(runCreate);
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

  async transitionStatus(
    projectId: string,
    taskId: string,
    newStatus: TaskStatus
  ) {
    const task = await this.taskRepo.findOne({
      where: { id: taskId, project: { id: projectId } }
    });

    if (!task) throw new AppError("Task not found", 404);

    const allowed = VALID_TRANSITIONS[task.status];

    if (!allowed.includes(newStatus)) {
      throw new AppError(
        `Invalid transition: cannot move from "${task.status}" to "${newStatus}"`,
        400
      );
    }

    task.status = newStatus;
    return await this.taskRepo.save(task);
  }

  async listTasks(
    projectId: string,
    page: number,
    limit: number,
    status?: TaskStatus
  ) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.taskRepo.findAndCount({
      where: {
        project: { id: projectId },
        ...(status && { status })
      },
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
        tatalPages: Math.ceil(total / limit)
      }
    };
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

import { AppDataSource } from "../data-source";
import { Tag } from "../entities/Tag";
import { Task } from "../entities/Task";
import { AppError } from "../utils/AppError";

export class TagService {
  private tagRepo = AppDataSource.getRepository(Tag);
  private taskRepo = AppDataSource.getRepository(Task);

  async createTag(orgId: string, name: string, color?: string) {
    const tag = this.tagRepo.create({
      name,
      color,
      organization: { id: orgId }
    });
    return await this.tagRepo.save(tag);
  }

  async getOrgTags(orgId: string) {
    return await this.tagRepo.find({ where: { organization: { id: orgId } } });
  }

  async attachToTask(taskId: string, tagId: string) {
    const tag = await this.tagRepo.findOne({
      where: { id: tagId },
      relations: ["organization"]
    });
    const task = await this.taskRepo.findOne({
      where: { id: taskId },
      relations: ["project", "project.organization"]
    });

    if (tag?.organization.id !== task?.project.organization.id) {
      throw new AppError("Tag does not belong to this organization", 400);
    }
    await AppDataSource.createQueryBuilder()
      .relation(Task, "tags")
      .of(taskId)
      .add(tagId);
  }

  async detachFromTask(taskId: string, tagId: string) {
    await AppDataSource.createQueryBuilder()
      .relation(Task, "tags")
      .of(taskId)
      .remove(tagId);
  }
}

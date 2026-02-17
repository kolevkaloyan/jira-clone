import { AppDataSource } from "../data-source";
import { Comment } from "../entities/Comment";
import { AppError } from "../utils/AppError";

export class CommentService {
  private commentRepo = AppDataSource.getRepository(Comment);

  async addComment(taskId: string, userId: string, content: string) {
    const comment = this.commentRepo.create({
      content,
      task: { id: taskId },
      author: { id: userId }
    });

    return await this.commentRepo.save(comment);
  }

  async getTaskComments(taskId: string) {
    return await this.commentRepo.find({
      where: { task: { id: taskId } },
      relations: ["author"],
      order: { createdAt: "DESC" },
      select: {
        author: { id: true, fullName: true }
      }
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepo.findOne({
      where: { id: commentId },
      relations: ["author"]
    });

    if (!comment) throw new AppError("Comment not found", 404);

    if (comment.author.id !== userId) {
      throw new AppError("You can only delete your own comments", 403);
    }

    return await this.commentRepo.remove(comment);
  }
}

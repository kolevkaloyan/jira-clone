import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { AppError } from "../utils/AppError";
import bcrypt from "bcrypt";

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  }

  async updateProfile(userId: string, data: Partial<User>) {
    const user = await this.getProfile(userId);

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    Object.assign(user, data);

    await this.userRepository.save(user);

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { generateTokens } from "../utils/jwt.util";
import { CreateUserDto, LoginDto } from "../dtos/auth.dto";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async signup(data: CreateUserDto) {
    const { email, password, fullName } = data;

    const existingUser = await this.userRepository.findOne({
      where: { email }
    });

    if (existingUser) throw new Error("User already exists");

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName
    });

    this.userRepository.save(user);

    return generateTokens(user.id);
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.userRepository.findOne({
      where: { email: email },
      select: ["id", "password", "email"]
    });

    if (!user) throw new Error("Invalid credentials!");

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new Error("Invalid credentials!");
    }

    return generateTokens(user.id);
  }
}

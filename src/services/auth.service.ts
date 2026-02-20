import bcrypt from "bcrypt";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { generateTokens, storeRefreshToken } from "../utils/jwt.util";
import { CreateUserDto, LoginDto } from "../dtos/auth.dto";
import { AppError } from "../utils/AppError";

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async signup(data: CreateUserDto) {
    const { email, password, fullName } = data;

    const existingUser = await this.userRepository.findOne({
      where: { email }
    });

    if (existingUser) throw new AppError("User already exists", 409);

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      fullName
    });

    await this.userRepository.save(user);

    const { accessToken, refreshToken } = generateTokens(user.id);

    await storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }

  async login(data: LoginDto) {
    const { email, password } = data;

    const user = await this.userRepository.findOne({
      where: { email: email },
      select: ["id", "password", "email"]
    });

    if (!user) throw new AppError("Invalid credentials", 401);

    const isPasswordMatching = await bcrypt.compare(password, user.password);

    if (!isPasswordMatching) {
      throw new AppError("Invalid credentials", 401);
    }

    const { accessToken, refreshToken } = generateTokens(user.id);

    await storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken };
  }
}

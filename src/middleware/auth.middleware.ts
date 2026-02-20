import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { verifyAccessToken } from "../utils/jwt.util";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export const protect = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) throw new AppError("You are not logged in", 401);

    const decoded = verifyAccessToken(token);

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.userId } });

    if (!user || !user.isActive) {
      throw new AppError("Your account is not yet activated", 403);
    }

    req.user = { id: decoded.userId };
    next();
  }
);

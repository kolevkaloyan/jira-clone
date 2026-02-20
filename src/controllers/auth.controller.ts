import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { SignupSchema, LoginSchema } from "../dtos/auth.dto";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import {
  revokeRefreshToken,
  rotateRefreshToken,
  verifyRefreshToken
} from "../utils/jwt.util";
import {
  clearRefreshTokenCookie,
  setRefreshTokenCookie
} from "../utils/cookies";

const authService = new AuthService();

export const signup = catchAsync(async (req: Request, res: Response) => {
  const validatedData = SignupSchema.parse(req.body);
  const { accessToken, refreshToken } = await authService.signup(validatedData);

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({ accessToken });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const validatedData = LoginSchema.parse(req.body);
  const { accessToken, refreshToken } = await authService.login(validatedData);

  setRefreshTokenCookie(res, refreshToken);

  res.json({ accessToken });
});

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token provided", 400);
    }

    await revokeRefreshToken(refreshToken);

    clearRefreshTokenCookie(res);

    res.status(200).json({ message: "Logged out successfully" });
  }
);

export const refreshTokens = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new AppError("No refresh token provided", 401);
    }

    verifyRefreshToken(refreshToken);

    const { accessToken, refreshToken: newRefreshToken } =
      await rotateRefreshToken(refreshToken);

    setRefreshTokenCookie(res, newRefreshToken);

    res.status(200).json({ accessToken });
  }
);

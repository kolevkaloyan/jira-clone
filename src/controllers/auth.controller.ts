import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { SignupSchema, LoginSchema } from "../dtos/auth.dto";
import { catchAsync } from "../utils/catchAsync";

const authService = new AuthService();

export const signup = catchAsync(async (req: Request, res: Response) => {
  const validatedData = SignupSchema.parse(req.body);
  const tokens = await authService.signup(validatedData);

  res.status(201).json(tokens);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const validatedData = LoginSchema.parse(req.body);
  const tokens = await authService.login(validatedData);

  res.json(tokens);
});

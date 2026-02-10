import { Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { SignupSchema, LoginSchema } from "../dtos/auth.dto";

const authService = new AuthService();

export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = SignupSchema.parse(req.body);
    const tokens = await authService.signup(validatedData);

    res.status(201).json(tokens);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Validation failed!" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = LoginSchema.parse(req.body);
    const tokens = await authService.login(validatedData);

    res.json(tokens);
  } catch (error: any) {
    res.status(400).json({ error: error.message || "Invalid credentials!" });
  }
};

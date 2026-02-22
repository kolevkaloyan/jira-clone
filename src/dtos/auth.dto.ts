import { z } from "zod";

export const SignupSchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(32),
  fullName: z.string().min(2).optional()
});

export const LoginSchema = z.object({
  email: z.email(),
  password: z.string()
});

export type CreateUserDto = z.infer<typeof SignupSchema>;
export type LoginDto = z.infer<typeof LoginSchema>;

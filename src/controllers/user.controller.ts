import { Request, Response } from "express";
import { UserService } from "../services/user.service";
import { catchAsync } from "../utils/catchAsync";

const userService = new UserService();

export const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.getProfile(req.user.id);

  res.status(200).json({
    status: "success",
    data: { user }
  });
});

export const updateMe = catchAsync(async (req: Request, res: Response) => {
  const updatedUser = await userService.updateProfile(req.user.id, req.body);

  res.status(200).json({
    status: "success",
    data: { user: updatedUser }
  });
});

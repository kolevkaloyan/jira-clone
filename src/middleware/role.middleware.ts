import { catchAsync } from "../utils/catchAsync";
import { NextFunction, Request, Response } from "express";
import { AppDataSource } from "../data-source";
import {
  EnrollmentStatus,
  OrganizationRole,
  UserOrganization
} from "../entities/UserOrganization";
import { AppError } from "../utils/AppError";

export const isOwner = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orgId } = req.params;
    const userId = req.body.userId;

    const membership = await AppDataSource.getRepository(
      UserOrganization
    ).findOne({
      where: {
        organization: { id: orgId as string },
        user: { id: userId },
        role: OrganizationRole.OWNER
      }
    });

    if (!membership)
      throw new AppError(
        "Only the organization owner can perform this action!",
        403
      );

    next();
  }
);

export const isMember = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { orgId } = req.params;
    const userId = req.user.id;

    if (!orgId) {
      throw new AppError("Organization ID is required for this route", 400);
    }

    const membership = await AppDataSource.getRepository(
      UserOrganization
    ).findOne({
      where: {
        organization: { id: orgId as string },
        user: { id: userId },
        status: EnrollmentStatus.ACCEPTED
      }
    });

    if (!membership) {
      throw new AppError("You do not have access to this organization", 403);
    }

    next();
  }
);

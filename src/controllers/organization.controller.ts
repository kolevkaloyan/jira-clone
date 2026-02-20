import { OrganizationService } from "../services/organization.service";
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { setRefreshTokenCookie } from "../utils/cookies";

const orgService = new OrganizationService();

export const create = catchAsync(async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = req.user.id;

  const organization = await orgService.createOrg(name, userId);

  res.status(201).json({
    status: "success",
    data: { organization }
  });
});

export const getOrgs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const userOrganizations = await orgService.getMyOrgs(userId);

  res.status(200).json({
    status: "success",
    data: { organizations: userOrganizations }
  });
});

export const inviteUser = catchAsync(async (req: Request, res: Response) => {
  const { orgId } = req.params;
  const { email } = req.body;

  const { inviteToken } = await orgService.inviteUser(orgId as string, email);

  res.status(200).json({
    status: "success",
    message: "Invitation sent successfully!",
    data: { inviteToken }
    //In a production app the invite will be sent via email but for API testing purposes I'm doing it here.
  });
});

export const acceptInvite = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.params;

  const result = await orgService.acceptInvite(token as string);

  setRefreshTokenCookie(res, result.refreshToken);

  res.status(200).json({
    status: "success",
    message: "Account activated and joined organization successfully",
    data: {
      accessToken: result.accessToken,
      membership: result.membership
    }
  });
});

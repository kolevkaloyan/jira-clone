import { OrganizationService } from "../services/organization.service";
import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";

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

  const invitation = await orgService.inviteUser(orgId as string, email);

  res.status(200).json({
    status: "Success",
    message: "Invitation sent successfully!"
  });
});

export const getMyInvitations = catchAsync(
  async (req: Request, res: Response) => {
    const invitations = await orgService.getPendingInvites(req.user.id);

    console.log(invitations, "organizations/invitations");

    res.status(200).json({
      status: "success",
      data: { invitations }
    });
  }
);

export const respondToInvitation = catchAsync(
  async (req: Request, res: Response) => {
    const { membershipId } = req.params;
    const { accept } = req.body;
    const userId = req.user.id;

    const result = await orgService.respondToInvitation(
      membershipId as string,
      userId,
      accept
    );

    res.status(200).json({
      status: "success",
      data: result
    });
  }
);

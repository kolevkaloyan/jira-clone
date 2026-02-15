import { AppDataSource } from "../data-source";
import { Organization } from "../entities/Organization";
import { User, UserRole } from "../entities/User";
import {
  EnrollmentStatus,
  OrganizationRole,
  UserOrganization
} from "../entities/UserOrganization";
import { AppError } from "../utils/AppError";

export class OrganizationService {
  private userOrgRepo = AppDataSource.getRepository(UserOrganization);
  private userRepo = AppDataSource.getRepository(User);

  async createOrg(name: string, userId: string) {
    return await AppDataSource.manager.transaction(
      async (transactionalEntityManager) => {
        const existingOrg = await transactionalEntityManager.findOne(
          Organization,
          {
            where: { name }
          }
        );

        if (existingOrg) {
          throw new AppError("Organization already exists!", 400);
        }

        const newOrg = transactionalEntityManager.create(Organization, {
          name
        });
        const savedOrg = await transactionalEntityManager.save(newOrg);

        const membership = transactionalEntityManager.create(UserOrganization, {
          role: OrganizationRole.OWNER,
          user: { id: userId } as User,
          organization: savedOrg
        });

        await transactionalEntityManager.save(membership);

        return savedOrg;
      }
    );
  }

  async getMyOrgs(userId: string) {
    const memberships = await this.userOrgRepo.find({
      where: { user: { id: userId } },
      relations: ["organization"]
    });

    return memberships.map((membership) => membership.organization);
  }

  async inviteUser(orgId: string, email: string) {
    const userToInvite = await this.userRepo.findOne({
      where: { email: email }
    });

    if (!userToInvite)
      throw new AppError("No user found with that email!", 404);
    //check if already in organization
    const existingUser = await this.userOrgRepo.findOne({
      where: { organization: { id: orgId }, user: { id: userToInvite.id } }
    });

    if (existingUser)
      throw new AppError(
        "User is already a member or has a pending invite!",
        400
      );

    const invitation = this.userOrgRepo.create({
      organization: { id: orgId } as any,
      user: { id: userToInvite.id } as any,
      role: OrganizationRole.MEMBER,
      status: EnrollmentStatus.PENDING
    });

    return this.userOrgRepo.save(invitation);
  }

  async getPendingInvites(userId: string) {
    const pendingInvites = await this.userOrgRepo.find({
      where: { user: { id: userId }, status: EnrollmentStatus.PENDING },
      relations: ["organization"]
    });
    return pendingInvites;
  }

  async respondToInvitation(
    membershipId: string,
    userId: string,
    accept: boolean
  ) {
    const membership = await this.userOrgRepo.findOne({
      where: {
        user: { id: userId },
        id: membershipId,
        status: EnrollmentStatus.PENDING
      }
    });

    if (!membership) {
      throw new AppError("Invitation not found or already processed", 404);
    }

    if (accept) {
      membership.status = EnrollmentStatus.ACCEPTED;
      return await this.userOrgRepo.save(membership);
    } else {
      this.userOrgRepo.remove(membership);
      return { message: "Invitation rejected and removed" };
    }
  }
}

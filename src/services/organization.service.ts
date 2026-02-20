import { AppDataSource } from "../data-source";
import { Organization } from "../entities/Organization";
import { User } from "../entities/User";
import {
  EnrollmentStatus,
  OrganizationRole,
  UserOrganization
} from "../entities/UserOrganization";
import { AppError } from "../utils/AppError";
import {
  consumeInviteToken,
  generateInviteToken,
  generateTempPassword,
  generateTokens,
  storeInviteToken,
  storeRefreshToken,
  verifyInviteToken
} from "../utils/jwt.util";
import bcrypt from "bcrypt";

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
          status: EnrollmentStatus.ACCEPTED,
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
    let user = await this.userRepo.findOne({ where: { email } });

    if (user) {
      const existingMembership = await this.userOrgRepo.findOne({
        where: { organization: { id: orgId }, user: { id: user.id } }
      });
      if (existingMembership) {
        throw new AppError(
          "User is already a member or has a pending invite!",
          400
        );
      }
    } else {
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      user = this.userRepo.create({
        email,
        password: hashedPassword,
        fullName: email,
        isActive: false
      });

      await this.userRepo.save(user);
    }

    const token = generateInviteToken(orgId, email);
    await storeInviteToken(token);

    return { inviteToken: token };
  }

  async acceptInvite(token: string) {
    const { orgId, email } = verifyInviteToken(token);

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new AppError("User not found", 404);

    await consumeInviteToken(token);

    if (!user.isActive) {
      const tempPassword = generateTempPassword();
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      user.isActive = true;
      user.password = hashedPassword;
      await this.userRepo.save(user);
    }

    const existingMembership = await this.userOrgRepo.findOne({
      where: { organization: { id: orgId }, user: { id: user.id } }
    });
    if (existingMembership) {
      throw new AppError("You are already a member of this organization", 400);
    }

    const membership = this.userOrgRepo.create({
      organization: { id: orgId } as any,
      user: { id: user.id } as any,
      role: OrganizationRole.MEMBER,
      status: EnrollmentStatus.ACCEPTED
    });

    await this.userOrgRepo.save(membership);

    //imidiately log in the user after accepting
    const { accessToken, refreshToken } = generateTokens(user.id);
    await storeRefreshToken(user.id, refreshToken);

    return { accessToken, refreshToken, membership };
  }
}

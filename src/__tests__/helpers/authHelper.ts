import request from "supertest";
import bcrypt from "bcrypt";
import { testDataSource } from "../setup";
import { User } from "../../entities/User";
import { Organization } from "../../entities/Organization";
import {
  UserOrganization,
  OrganizationRole,
  EnrollmentStatus
} from "../../entities/UserOrganization";

const getApp = () => require("../../app").default;

export const createUser = async (overrides: Partial<User> = {}) => {
  const repo = testDataSource.getRepository(User);
  const user = repo.create({
    email: "test@test.com",
    password: await bcrypt.hash("password123", 12),
    fullName: "Test User",
    isActive: true,
    ...overrides
  });

  return repo.save(user);
};

export const createOrg = async (name = "Test Org") => {
  const repo = testDataSource.getRepository(Organization);
  return repo.save(repo.create({ name }));
};

export const createMembership = async (
  userId: string,
  orgId: string,
  role = OrganizationRole.OWNER
) => {
  const repo = testDataSource.getRepository(UserOrganization);
  return repo.save(
    repo.create({
      user: { id: userId } as any,
      organization: { id: orgId } as any,
      role,
      status: EnrollmentStatus.ACCEPTED
    })
  );
};

export const loginAs = async (
  email = "test@test.com",
  password = "password123"
) => {
  const app = getApp();
  const res = await request(app)
    .post("/api/v1/auth/login")
    .send({ email, password });

  const accessToken = res.body?.accessToken;

  return {
    accessToken: accessToken as string,
    cookie: res.headers["set-cookie"] as string
  };
};

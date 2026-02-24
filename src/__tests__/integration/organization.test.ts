import request from "supertest";
import {
  createUser,
  createOrg,
  createMembership,
  loginAs
} from "../helpers/authHelper";
import { testDataSource } from "../setup";
import { OrganizationRole } from "../../entities/UserOrganization";
import { generateInviteToken } from "../../utils/jwt.util";

const getApp = () => require("../../app").default;

describe("Organization Endpoints", () => {
  let ownerToken: string;
  let owner: any;
  let org: any;

  beforeEach(async () => {
    owner = await createUser({ email: "owner@test.com" });
    console.log(owner, "kur");
    org = await createOrg("Test Org");
    await createMembership(owner.id, org.id, OrganizationRole.OWNER);
    const auth = await loginAs("owner@test.com");
    ownerToken = auth.accessToken;
  });

  describe("POST /organization", () => {
    it("should create an organization and set creator as OWNER", async () => {
      const res = await request(getApp())
        .post("/api/v1/organization")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "New Org" });

      expect(res.status).toBe(201);
      expect(res.body.data.organization.name).toBe("New Org");
    });

    it("should return 400 if org name already exists", async () => {
      const res = await request(getApp())
        .post("/api/v1/organization")
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Test Org" });

      expect(res.status).toBe(400);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(getApp())
        .post("/api/v1/organization")
        .send({ name: "Unauth Org" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /organization", () => {
    it("should return organizations the user belongs to", async () => {
      const res = await request(getApp())
        .get("/api/v1/organization")
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.organizations).toHaveLength(1);
      expect(res.body.data.organizations[0].name).toBe("Test Org");
    });

    it("should return empty array if user has no orgs", async () => {
      await createUser({ email: "lonely@test.com" });
      const auth = await loginAs("lonely@test.com");

      const res = await request(getApp())
        .get("/api/v1/organization")
        .set("Authorization", `Bearer ${auth.accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.organizations).toHaveLength(0);
    });
  });

  describe("POST /organization/:orgId/invite", () => {
    it("should generate an invite token for a new user", async () => {
      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/invite`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ email: "newuser@test.com" });

      expect(res.status).toBe(200);
      expect(res.body.data.inviteToken).toBeDefined();
    });

    it("should return 403 if requester is not owner or admin", async () => {
      const member = await createUser({ email: "member@test.com" });
      await createMembership(member.id, org.id, OrganizationRole.MEMBER);
      const auth = await loginAs("member@test.com");

      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/invite`)
        .set("Authorization", `Bearer ${auth.accessToken}`)
        .send({ email: "someone@test.com" });

      expect(res.status).toBe(403);
    });

    it("should return 400 if user is already a member", async () => {
      const member = await createUser({ email: "member@test.com" });
      await createMembership(member.id, org.id, OrganizationRole.MEMBER);

      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/invite`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ email: "member@test.com" });

      expect(res.status).toBe(400);
    });

    it("should return 400 if inviting yourself", async () => {
      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/invite`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ email: "owner@test.com" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /organization/accept-invite/:token", () => {
    it("should activate provisional account and create membership", async () => {
      const { redis } = require("../../redis/redis-client");
      const token = generateInviteToken(org.id, "provisional@test.com");
      redis.get.mockResolvedValueOnce("provisional@test.com");

      const userRepo = testDataSource.getRepository("User");
      await userRepo.save(
        userRepo.create({
          email: "provisional@test.com",
          password: "hashedpassword",
          fullName: "provisional@test.com",
          isActive: false
        })
      );

      const res = await request(getApp()).post(
        `/api/v1/organization/accept-invite/${token}`
      );

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.membership).toBeDefined();
    });

    it("should return 401 for invalid token", async () => {
      const res = await request(getApp()).post(
        "/api/v1/organization/accept-invite/invalid-token"
      );

      expect(res.status).toBe(401);
    });
  });
});

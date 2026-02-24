import request from "supertest";
import {
  createUser,
  createOrg,
  createMembership,
  loginAs
} from "../helpers/authHelper";
import { testDataSource } from "../setup";
import { OrganizationRole } from "../../entities/UserOrganization";
import { Project } from "../../entities/Project";

const getApp = () => require("../../app").default;

const createProject = async (
  orgId: string,
  overrides: Partial<Project> = {}
) => {
  const repo = testDataSource.getRepository(Project);
  return repo.save(
    repo.create({
      name: "Test Project",
      key: "TST",
      description: "A test project",
      organization: { id: orgId } as any,
      ...overrides
    })
  );
};

describe("Project Endpoints", () => {
  let ownerToken: string;
  let memberToken: string;
  let owner: any;
  let member: any;
  let org: any;

  beforeEach(async () => {
    owner = await createUser({ email: "owner@test.com" });
    member = await createUser({ email: "member@test.com" });
    org = await createOrg("Test Org");

    await createMembership(owner.id, org.id, OrganizationRole.OWNER);
    await createMembership(member.id, org.id, OrganizationRole.MEMBER);

    const ownerAuth = await loginAs("owner@test.com");
    const memberAuth = await loginAs("member@test.com");

    ownerToken = ownerAuth.accessToken;
    memberToken = memberAuth.accessToken;
  });

  describe("POST /organization/:orgId/project", () => {
    it("should create a project successfully", async () => {
      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "New Project", key: "NP", description: "A new project" });

      expect(res.status).toBe(201);
      expect(res.body.data.project.name).toBe("New Project");
      expect(res.body.data.project.key).toBe("NP");
    });

    it("should uppercase and trim the project key", async () => {
      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "New Project", key: "  np  " });

      expect(res.status).toBe(201);
      expect(res.body.data.project.key).toBe("NP");
    });

    it("should create a project with initial tasks", async () => {
      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({
          name: "Project With Tasks",
          key: "PWT",
          initialTasks: [{ title: "Task One" }, { title: "Task Two" }]
        });

      expect(res.status).toBe(201);
      expect(res.body.data.project.tasks).toHaveLength(2);
    });

    it("should return 400 if project key already exists in the org", async () => {
      await createProject(org.id, { key: "DUP" });

      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Duplicate Key Project", key: "DUP" });

      expect(res.status).toBe(400);
    });

    it("should allow the same key in a different org", async () => {
      const otherOrg = await createOrg("Other Org");
      await createProject(otherOrg.id, { key: "SAME" });

      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Same Key Different Org", key: "SAME" });

      expect(res.status).toBe(201);
    });

    it("should return 400 if key is missing", async () => {
      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "No Key Project" });

      expect(res.status).toBe(400);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(getApp())
        .post(`/api/v1/organization/${org.id}/project`)
        .send({ name: "Unauth Project", key: "UP" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /organization/:orgId/project", () => {
    it("should return paginated project for the org", async () => {
      await createProject(org.id, { name: "Project A", key: "PA" });
      await createProject(org.id, { name: "Project B", key: "PB" });

      const res = await request(getApp())
        .get(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(2);
      expect(res.body.data.pagination.page).toBe(1);
    });

    it("should return empty list if org has no project", async () => {
      const res = await request(getApp())
        .get(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
    });

    it("should paginate correctly", async () => {
      await createProject(org.id, { name: "Project A", key: "PA" });
      await createProject(org.id, { name: "Project B", key: "PB" });
      await createProject(org.id, { name: "Project C", key: "PC" });

      const res = await request(getApp())
        .get(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .query({ page: 1, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });

    it("should not return project from other orgs", async () => {
      const otherOrg = await createOrg("Other Org");
      await createProject(otherOrg.id, { name: "Other Project", key: "OP" });
      await createProject(org.id, { name: "My Project", key: "MP" });

      const res = await request(getApp())
        .get(`/api/v1/organization/${org.id}/project`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].name).toBe("My Project");
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(getApp()).get(
        `/api/v1/organization/${org.id}/project`
      );

      expect(res.status).toBe(401);
    });
  });

  describe("GET /organization/:orgId/project/:projectId", () => {
    it("should return a project by id", async () => {
      const project = await createProject(org.id, {
        name: "Fetchable Project",
        key: "FP"
      });

      const res = await request(getApp())
        .get(`/api/v1/organization/${org.id}/project/${project.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.project.id).toBe(project.id);
      expect(res.body.data.project.name).toBe("Fetchable Project");
    });

    it("should return 404 if project does not exist", async () => {
      const res = await request(getApp())
        .get(
          `/api/v1/organization/${org.id}/project/00000000-0000-0000-0000-000000000000`
        )
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 404 if project belongs to a different org", async () => {
      const otherOrg = await createOrg("Other Org");
      const project = await createProject(otherOrg.id, {
        name: "Other Project",
        key: "OP"
      });

      const res = await request(getApp())
        .get(`/api/v1/organization/${org.id}/project/${project.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const project = await createProject(org.id);

      const res = await request(getApp()).get(
        `/api/v1/organization/${org.id}/project/${project.id}`
      );

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /organization/:orgId/project/:projectId", () => {
    it("should update a project's name and description", async () => {
      const project = await createProject(org.id, {
        name: "Old Name",
        key: "OLD"
      });

      const res = await request(getApp())
        .patch(`/api/v1/organization/${org.id}/project/${project.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "New Name", description: "Updated description" });

      expect(res.status).toBe(200);
      expect(res.body.data.project.name).toBe("New Name");
      expect(res.body.data.project.description).toBe("Updated description");
    });

    it("should return 404 if project does not exist", async () => {
      const res = await request(getApp())
        .patch(
          `/api/v1/organization/${org.id}/project/00000000-0000-0000-0000-000000000000`
        )
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Ghost Update" });

      expect(res.status).toBe(404);
    });

    it("should return 404 if project belongs to a different org", async () => {
      const otherOrg = await createOrg("Other Org");
      const project = await createProject(otherOrg.id, {
        name: "Other Project",
        key: "OP"
      });

      const res = await request(getApp())
        .patch(`/api/v1/organization/${org.id}/project/${project.id}`)
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ name: "Hijacked" });

      expect(res.status).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const project = await createProject(org.id);

      const res = await request(getApp())
        .patch(`/api/v1/organization/${org.id}/project/${project.id}`)
        .send({ name: "Unauth Update" });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /organization/:orgId/project/:projectId", () => {
    it("should delete a project successfully", async () => {
      const project = await createProject(org.id, {
        name: "To Be Deleted",
        key: "DEL"
      });

      const res = await request(getApp())
        .delete(`/api/v1/organization/${org.id}/project/${project.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("Project deleted");

      const deleted = await testDataSource
        .getRepository(Project)
        .findOneBy({ id: project.id });
      expect(deleted).toBeNull();
    });

    it("should return 404 if project does not exist", async () => {
      const res = await request(getApp())
        .delete(
          `/api/v1/organization/${org.id}/project/00000000-0000-0000-0000-000000000000`
        )
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 404 if project belongs to a different org", async () => {
      const otherOrg = await createOrg("Other Org");
      const project = await createProject(otherOrg.id, {
        name: "Other Project",
        key: "OP"
      });

      const res = await request(getApp())
        .delete(`/api/v1/organization/${org.id}/project/${project.id}`)
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const project = await createProject(org.id);

      const res = await request(getApp()).delete(
        `/api/v1/organization/${org.id}/project/${project.id}`
      );

      expect(res.status).toBe(401);
    });
  });
});

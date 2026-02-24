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
import { Task, TaskStatus } from "../../entities/Task";

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
      lastTaskNumber: 0,
      organization: { id: orgId } as any,
      ...overrides
    })
  );
};

const createTask = async (
  projectId: string,
  orgId: string,
  overrides: Partial<Task> = {}
) => {
  const projectRepo = testDataSource.getRepository(Project);
  const project = await projectRepo.findOneByOrFail({ id: projectId });
  project.lastTaskNumber += 1;
  await projectRepo.save(project);

  const repo = testDataSource.getRepository(Task);
  return repo.save(
    repo.create({
      title: "Test Task",
      status: TaskStatus.TODO,
      taskNumber: project.lastTaskNumber,
      key: `${project.key}-${project.lastTaskNumber}`,
      project: { id: projectId } as any,
      ...overrides
    })
  );
};

describe("Task Endpoints", () => {
  let ownerToken: string;
  let memberToken: string;
  let owner: any;
  let member: any;
  let org: any;
  let project: any;

  const taskUrl = (projectId: string, taskId?: string) =>
    `/api/v1/organization/${org.id}/project/${projectId}/task${taskId ? `/${taskId}` : ""}`;

  const transitionUrl = (projectId: string, taskId: string) =>
    `${taskUrl(projectId, taskId)}/transition`;

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

    project = await createProject(org.id);
  });

  describe("POST /organization/:orgId/project/:projectId/task", () => {
    it("should create a task successfully", async () => {
      const res = await request(getApp())
        .post(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "New Task", description: "A task" });

      expect(res.status).toBe(201);
      expect(res.body.data.task.title).toBe("New Task");
      expect(res.body.data.task.status).toBe(TaskStatus.TODO);
    });

    it("should auto-generate key and taskNumber", async () => {
      const res = await request(getApp())
        .post(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Numbered Task" });

      expect(res.status).toBe(201);
      expect(res.body.data.task.taskNumber).toBe(1);
      expect(res.body.data.task.key).toBe("TST-1");
    });

    it("should increment taskNumber on each create", async () => {
      await request(getApp())
        .post(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "First Task" });

      const res = await request(getApp())
        .post(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Second Task" });

      expect(res.status).toBe(201);
      expect(res.body.data.task.taskNumber).toBe(2);
      expect(res.body.data.task.key).toBe("TST-2");
    });

    it("should assign a user if assigneeId is provided", async () => {
      const res = await request(getApp())
        .post(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Assigned Task", assigneeId: member.id });

      expect(res.status).toBe(201);
      expect(res.body.data.task.assignee).toBeDefined();
    });

    it("should return 404 if project does not exist", async () => {
      const res = await request(getApp())
        .post(taskUrl("00000000-0000-0000-0000-000000000000"))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Ghost Task" });

      expect(res.status).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(getApp())
        .post(taskUrl(project.id))
        .send({ title: "Unauth Task" });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /organization/:orgId/project/:projectId/task", () => {
    it("should return paginated tasks for the project", async () => {
      await createTask(project.id, org.id, { title: "Task A" });
      await createTask(project.id, org.id, { title: "Task B" });

      const res = await request(getApp())
        .get(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(2);
    });

    it("should return empty list if no tasks", async () => {
      const res = await request(getApp())
        .get(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
    });

    it("should filter tasks by status", async () => {
      await createTask(project.id, org.id, {
        title: "Todo Task",
        status: TaskStatus.TODO
      });
      await createTask(project.id, org.id, {
        title: "In Progress Task",
        status: TaskStatus.IN_PROGRESS
      });

      const res = await request(getApp())
        .get(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .query({ status: TaskStatus.TODO });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].title).toBe("Todo Task");
    });

    it("should paginate correctly", async () => {
      await createTask(project.id, org.id, { title: "Task A" });
      await createTask(project.id, org.id, { title: "Task B" });
      await createTask(project.id, org.id, { title: "Task C" });

      const res = await request(getApp())
        .get(taskUrl(project.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .query({ page: 1, limit: 2 });

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.pagination.totalPages).toBe(2);
    });

    it("should return 401 if not authenticated", async () => {
      const res = await request(getApp()).get(taskUrl(project.id));
      expect(res.status).toBe(401);
    });
  });

  describe("GET /organization/:orgId/project/:projectId/task/:taskId", () => {
    it("should return a task by id", async () => {
      const task = await createTask(project.id, org.id, {
        title: "Fetchable Task"
      });

      const res = await request(getApp())
        .get(taskUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.task.id).toBe(task.id);
      expect(res.body.data.task.title).toBe("Fetchable Task");
    });

    it("should return 404 if task does not exist", async () => {
      const res = await request(getApp())
        .get(taskUrl(project.id, "00000000-0000-0000-0000-000000000000"))
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 404 if task belongs to a different project", async () => {
      const otherProject = await createProject(org.id, {
        name: "Other",
        key: "OTH"
      });
      const task = await createTask(otherProject.id, org.id);

      const res = await request(getApp())
        .get(taskUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const task = await createTask(project.id, org.id);
      const res = await request(getApp()).get(taskUrl(project.id, task.id));
      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /organization/:orgId/project/:projectId/task/:taskId", () => {
    it("should update a task title and description", async () => {
      const task = await createTask(project.id, org.id, { title: "Old Title" });

      const res = await request(getApp())
        .patch(taskUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "New Title", description: "Updated" });

      expect(res.status).toBe(200);
      expect(res.body.data.task.title).toBe("New Title");
      expect(res.body.data.task.description).toBe("Updated");
    });

    it("should update assignee", async () => {
      const task = await createTask(project.id, org.id);

      const res = await request(getApp())
        .patch(taskUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ assigneeId: member.id });

      expect(res.status).toBe(200);
      expect(res.body.data.task.assignee).toBeDefined();
    });

    it("should return 404 if task does not exist", async () => {
      const res = await request(getApp())
        .patch(taskUrl(project.id, "00000000-0000-0000-0000-000000000000"))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ title: "Ghost" });

      expect(res.status).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const task = await createTask(project.id, org.id);

      const res = await request(getApp())
        .patch(taskUrl(project.id, task.id))
        .send({ title: "Unauth" });

      expect(res.status).toBe(401);
    });
  });

  describe("PATCH /organization/:orgId/project/:projectId/task/:taskId/transition", () => {
    it("should transition from TODO to IN_PROGRESS", async () => {
      const task = await createTask(project.id, org.id, {
        status: TaskStatus.TODO
      });

      const res = await request(getApp())
        .patch(transitionUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: TaskStatus.IN_PROGRESS });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    it("should transition from IN_PROGRESS to REVIEW", async () => {
      const task = await createTask(project.id, org.id, {
        status: TaskStatus.IN_PROGRESS
      });

      const res = await request(getApp())
        .patch(transitionUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: TaskStatus.REVIEW });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe(TaskStatus.REVIEW);
    });

    it("should transition from REVIEW to DONE", async () => {
      const task = await createTask(project.id, org.id, {
        status: TaskStatus.REVIEW
      });

      const res = await request(getApp())
        .patch(transitionUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: TaskStatus.DONE });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe(TaskStatus.DONE);
    });

    it("should allow reopening from DONE to TODO", async () => {
      const task = await createTask(project.id, org.id, {
        status: TaskStatus.DONE
      });

      const res = await request(getApp())
        .patch(transitionUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: TaskStatus.TODO });

      expect(res.status).toBe(200);
      expect(res.body.data.task.status).toBe(TaskStatus.TODO);
    });

    it("should return 400 for invalid transition (TODO to DONE)", async () => {
      const task = await createTask(project.id, org.id, {
        status: TaskStatus.TODO
      });

      const res = await request(getApp())
        .patch(transitionUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: TaskStatus.DONE });

      expect(res.status).toBe(400);
    });

    it("should return 400 if status is missing", async () => {
      const task = await createTask(project.id, org.id);

      const res = await request(getApp())
        .patch(transitionUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it("should return 404 if task does not exist", async () => {
      const res = await request(getApp())
        .patch(
          transitionUrl(project.id, "00000000-0000-0000-0000-000000000000")
        )
        .set("Authorization", `Bearer ${ownerToken}`)
        .send({ status: TaskStatus.IN_PROGRESS });

      expect(res.status).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const task = await createTask(project.id, org.id);

      const res = await request(getApp())
        .patch(transitionUrl(project.id, task.id))
        .send({ status: TaskStatus.IN_PROGRESS });

      expect(res.status).toBe(401);
    });
  });

  describe("DELETE /organization/:orgId/project/:projectId/task/:taskId", () => {
    it("should delete a task successfully", async () => {
      const task = await createTask(project.id, org.id, { title: "To Delete" });

      const res = await request(getApp())
        .delete(taskUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(204);

      const deleted = await testDataSource
        .getRepository(Task)
        .findOneBy({ id: task.id });
      expect(deleted).toBeNull();
    });

    it("should return 404 if task does not exist", async () => {
      const res = await request(getApp())
        .delete(taskUrl(project.id, "00000000-0000-0000-0000-000000000000"))
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 404 if task belongs to a different project", async () => {
      const otherProject = await createProject(org.id, {
        name: "Other",
        key: "OTH"
      });
      const task = await createTask(otherProject.id, org.id);

      const res = await request(getApp())
        .delete(taskUrl(project.id, task.id))
        .set("Authorization", `Bearer ${ownerToken}`);

      expect(res.status).toBe(404);
    });

    it("should return 401 if not authenticated", async () => {
      const task = await createTask(project.id, org.id);
      const res = await request(getApp()).delete(taskUrl(project.id, task.id));
      expect(res.status).toBe(401);
    });
  });
});

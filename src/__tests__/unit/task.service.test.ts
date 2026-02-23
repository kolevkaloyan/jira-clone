import { TaskService } from "../../services/task.service";
import { TaskStatus } from "../../entities/Task";

jest.mock("../../data-source", () => ({
  getDataSource: jest.fn(),
  AppDataSource: {
    getRepository: jest.fn(),
    manager: { transaction: jest.fn() },
    transaction: jest.fn()
  }
}));

jest.mock("../../redis/redis-client", () => ({
  redis: { set: jest.fn(), get: jest.fn(), del: jest.fn() }
}));

const mockTask = (overrides = {}) => ({
  id: "task-1",
  key: "BE-1",
  title: "Test task",
  status: TaskStatus.TODO,
  taskNumber: 1,
  order: 1,
  project: { id: "project-1" },
  ...overrides
});

let taskService: TaskService;
let mockRepo: any;

beforeEach(() => {
  mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
    delete: jest.fn()
  };

  const { AppDataSource } = require("../../data-source");
  AppDataSource.getRepository.mockReturnValue(mockRepo);

  taskService = new TaskService();
});

afterEach(() => jest.clearAllMocks());

describe("TaskService", () => {
  describe("transitionStatus()", () => {
    it("should transition from todo → in_progress", async () => {
      const task = mockTask({ status: TaskStatus.TODO });
      mockRepo.findOne.mockResolvedValue(task);
      mockRepo.save.mockResolvedValue({
        ...task,
        status: TaskStatus.IN_PROGRESS
      });

      const result = await taskService.transitionStatus(
        "project-1",
        "task-1",
        TaskStatus.IN_PROGRESS
      );

      expect(result.status).toBe(TaskStatus.IN_PROGRESS);
      expect(mockRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: TaskStatus.IN_PROGRESS })
      );
    });

    it("should transition from in_progress → review", async () => {
      const task = mockTask({ status: TaskStatus.IN_PROGRESS });
      mockRepo.findOne.mockResolvedValue(task);
      mockRepo.save.mockResolvedValue({ ...task, status: TaskStatus.REVIEW });

      const result = await taskService.transitionStatus(
        "project-1",
        "task-1",
        TaskStatus.REVIEW
      );

      expect(result.status).toBe(TaskStatus.REVIEW);
    });

    it("should transition from review → done", async () => {
      const task = mockTask({ status: TaskStatus.REVIEW });
      mockRepo.findOne.mockResolvedValue(task);
      mockRepo.save.mockResolvedValue({ ...task, status: TaskStatus.DONE });

      const result = await taskService.transitionStatus(
        "project-1",
        "task-1",
        TaskStatus.DONE
      );

      expect(result.status).toBe(TaskStatus.DONE);
    });

    it("should throw for invalid transition: todo → done", async () => {
      const task = mockTask({ status: TaskStatus.TODO });
      mockRepo.findOne.mockResolvedValue(task);

      await expect(
        taskService.transitionStatus("project-1", "task-1", TaskStatus.DONE)
      ).rejects.toThrow(
        'Invalid transition: cannot move from "todo" to "done"'
      );
    });

    it("should throw if task not found", async () => {
      mockRepo.findOne.mockResolvedValue(null);

      await expect(
        taskService.transitionStatus(
          "project-1",
          "task-999",
          TaskStatus.IN_PROGRESS
        )
      ).rejects.toThrow("Task not found");
    });
  });

  describe("auth service — unit tests", () => {
    let mockUserRepo: any;
    let authService: any;

    beforeEach(() => {
      jest.resetModules();

      jest.mock("../../utils/jwt.util", () => ({
        generateTokens: jest.fn().mockReturnValue({
          accessToken: "mock-access",
          refreshToken: "mock-refresh"
        }),
        storeRefreshToken: jest.fn().mockResolvedValue(undefined)
      }));

      mockUserRepo = {
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn()
      };

      const { AppDataSource } = require("../../data-source");
      AppDataSource.getRepository.mockReturnValue(mockUserRepo);

      const { AuthService } = require("../../services/auth.service");
      authService = new AuthService();
    });

    describe("signup()", () => {
      it("should create a user and return tokens", async () => {
        mockUserRepo.findOne.mockResolvedValue(null);
        mockUserRepo.create.mockReturnValue({
          id: "user-1",
          email: "test@test.com"
        });
        mockUserRepo.save.mockResolvedValue({
          id: "user-1",
          email: "test@test.com"
        });

        const result = await authService.signup({
          email: "test@test.com",
          password: "password123",
          fullName: "Test User"
        });

        expect(result.accessToken).toBe("mock-access");
        expect(result.refreshToken).toBe("mock-refresh");
        expect(mockUserRepo.save).toHaveBeenCalledTimes(1);
      });

      it("should throw if user already exists", async () => {
        mockUserRepo.findOne.mockResolvedValue({
          id: "user-1",
          email: "test@test.com"
        });

        await expect(
          authService.signup({
            email: "test@test.com",
            password: "password123"
          })
        ).rejects.toThrow("User already exists");
      });

      it("should hash the password before saving", async () => {
        mockUserRepo.findOne.mockResolvedValue(null);
        mockUserRepo.create.mockImplementation((data: any) => data);
        mockUserRepo.save.mockImplementation((data: any) => data);

        await authService.signup({
          email: "test@test.com",
          password: "password123"
        });

        const savedUser = mockUserRepo.save.mock.calls[0][0];
        expect(savedUser.password).not.toBe("password123");
        expect(savedUser.password).toMatch(/^\$2b\$/);
      });
    });

    describe("login()", () => {
      it("should return tokens for valid credentials", async () => {
        const bcrypt = require("bcrypt");
        const hashed = await bcrypt.hash("password123", 12);

        mockUserRepo.findOne.mockResolvedValue({
          id: "user-1",
          email: "test@test.com",
          password: hashed,
          isActive: true
        });

        const result = await authService.login({
          email: "test@test.com",
          password: "password123"
        });

        expect(result.accessToken).toBe("mock-access");
      });

      it("should throw for wrong password", async () => {
        const bcrypt = require("bcrypt");
        const hashed = await bcrypt.hash("correctpassword", 12);

        mockUserRepo.findOne.mockResolvedValue({
          id: "user-1",
          email: "test@test.com",
          password: hashed,
          isActive: true
        });

        await expect(
          authService.login({
            email: "test@test.com",
            password: "wrongpassword"
          })
        ).rejects.toThrow("Invalid credentials");
      });

      it("should throw for non-existent user", async () => {
        mockUserRepo.findOne.mockResolvedValue(null);

        await expect(
          authService.login({
            email: "nobody@test.com",
            password: "password123"
          })
        ).rejects.toThrow("Invalid credentials");
      });

      it("should throw if account is inactive", async () => {
        const bcrypt = require("bcrypt");
        const hashed = await bcrypt.hash("password123", 12);

        mockUserRepo.findOne.mockResolvedValue({
          id: "user-1",
          email: "inactive@test.com",
          password: hashed,
          isActive: false
        });

        await expect(
          authService.login({
            email: "inactive@test.com",
            password: "password123"
          })
        ).rejects.toThrow();
      });
    });
  });
});

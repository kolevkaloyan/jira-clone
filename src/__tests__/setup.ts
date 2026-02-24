import { DataSource } from "typeorm";
import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer
} from "@testcontainers/postgresql";
import { User } from "../entities/User";
import { Organization } from "../entities/Organization";
import { UserOrganization } from "../entities/UserOrganization";
import { Project } from "../entities/Project";
import { Task } from "../entities/Task";
import { Comment } from "../entities/Comment";
import { Tag } from "../entities/Tag";
import "dotenv/config";

let container: StartedPostgreSqlContainer;
export let testDataSource: DataSource;

jest.mock("../data-source", () => ({
  AppDataSource: {} as DataSource
}));

// Mock Redis
jest.mock("../redis/redis-client", () => ({
  redis: {
    set: jest.fn().mockResolvedValue("OK"),
    get: jest.fn().mockResolvedValue(null),
    del: jest.fn().mockResolvedValue(1),
    keys: jest.fn().mockResolvedValue([]),
    call: jest.fn()
  }
}));

// Mock rate limiter
jest.mock("../middleware/rateLimiter", () => ({
  loginLimiter: (req: any, res: any, next: any) => next(),
  signupLimiter: (req: any, res: any, next: any) => next(),
  refreshLimiter: (req: any, res: any, next: any) => next()
}));

beforeAll(async () => {
  container = await new PostgreSqlContainer("postgres:15-alpine")
    .withDatabase("testdb")
    .withUsername("testuser")
    .withPassword("testpass")
    .start();

  testDataSource = new DataSource({
    type: "postgres",
    host: container.getHost(),
    port: container.getPort(),
    username: container.getUsername(),
    password: container.getPassword(),
    database: container.getDatabase(),
    entities: [
      User,
      Organization,
      UserOrganization,
      Project,
      Task,
      Comment,
      Tag
    ],
    synchronize: true,
    logging: false
  });

  await testDataSource.initialize();

  const dataSourceModule = require("../data-source");
  Object.assign(dataSourceModule.AppDataSource, testDataSource);
  dataSourceModule.AppDataSource = testDataSource;
}, 60000);

afterAll(async () => {
  await testDataSource.destroy();
  await container.stop();
});

afterEach(async () => {
  const entities = testDataSource.entityMetadatas;
  for (const entity of entities) {
    const repo = testDataSource.getRepository(entity.name);
    await repo.query(`TRUNCATE TABLE "${entity.tableName}" CASCADE`);
  }
  jest.clearAllMocks();
});

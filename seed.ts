import "reflect-metadata";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { AppDataSource } from "./src/data-source";
import { Comment } from "./src/entities/Comment";
import { Organization } from "./src/entities/Organization";
import { Project } from "./src/entities/Project";
import { Tag } from "./src/entities/Tag";
import { Task, TaskStatus } from "./src/entities/Task";
import { User } from "./src/entities/User";
import {
  UserOrganization,
  OrganizationRole,
  EnrollmentStatus
} from "./src/entities/UserOrganization";
dotenv.config();

const seed = async () => {
  await AppDataSource.initialize();
  console.log("📦 Connected to database");

  await AppDataSource.query(`TRUNCATE TABLE
  comments, tasks_tags_tags, tasks, project,
  user_organizations, organizations, users,
  audit_logs
  RESTART IDENTITY CASCADE`);
  console.log("🧹 Cleared existing data");

  // ─── Users ───────────────────────────────────────────────
  const userRepo = AppDataSource.getRepository(User);

  const hashedPassword = await bcrypt.hash("password123", 12);

  const owner = userRepo.create({
    email: "owner@mock.com",
    password: hashedPassword,
    fullName: "Alice Owner",
    isActive: true
  });

  const member = userRepo.create({
    email: "member@mock.com",
    password: hashedPassword,
    fullName: "Bob Member",
    isActive: true
  });

  const pending = userRepo.create({
    email: "pending@mock.com",
    password: hashedPassword,
    fullName: "pending@mock.com",
    isActive: false
  });

  await userRepo.save([owner, member, pending]);
  console.log("👤 Seeded users");

  // ─── Organization ─────────────────────────────────────────
  const orgRepo = AppDataSource.getRepository(Organization);
  const userOrgRepo = AppDataSource.getRepository(UserOrganization);

  const org = orgRepo.create({ name: "Jira-clone Demo Org" });
  await orgRepo.save(org);

  await userOrgRepo.save([
    userOrgRepo.create({
      user: owner,
      organization: org,
      role: OrganizationRole.OWNER,
      status: EnrollmentStatus.ACCEPTED
    }),
    userOrgRepo.create({
      user: member,
      organization: org,
      role: OrganizationRole.MEMBER,
      status: EnrollmentStatus.ACCEPTED
    }),
    userOrgRepo.create({
      user: pending,
      organization: org,
      role: OrganizationRole.MEMBER,
      status: EnrollmentStatus.PENDING
    })
  ]);
  console.log("🏢 Seeded organization and memberships");

  // ─── Tags ────────────────────────────────────────────────
  const tagRepo = AppDataSource.getRepository(Tag);

  const [bugTag, featureTag, urgentTag] = await tagRepo.save([
    tagRepo.create({ name: "bug", color: "#FF0000", organization: org }),
    tagRepo.create({ name: "feature", color: "#00BFFF", organization: org }),
    tagRepo.create({ name: "urgent", color: "#FFA500", organization: org })
  ]);
  console.log("🏷️  Seeded tags");

  // ─── Projects ────────────────────────────────────────────
  const projectRepo = AppDataSource.getRepository(Project);

  const backendProject = projectRepo.create({
    name: "Backend API",
    key: "BE",
    description: "Core REST API built with Express and TypeORM",
    organization: org,
    lastTaskNumber: 0
  });

  const frontendProject = projectRepo.create({
    name: "Frontend App",
    key: "FE",
    description: "React frontend consuming the ProjectHub API",
    organization: org,
    lastTaskNumber: 0
  });

  await projectRepo.save([backendProject, frontendProject]);
  console.log("📁 Seeded projects");

  // ─── Tasks ───────────────────────────────────────────────
  const taskRepo = AppDataSource.getRepository(Task);

  const task1 = taskRepo.create({
    title: "Setup Express server",
    description: "Initialize the Express app with middleware and routing",
    status: TaskStatus.DONE,
    taskNumber: 1,
    key: "BE-1",
    project: backendProject,
    assignee: owner,
    tags: [featureTag]
  });

  const task2 = taskRepo.create({
    title: "Implement JWT authentication",
    description: "Add access and refresh token rotation with Redis",
    status: TaskStatus.DONE,
    taskNumber: 2,
    key: "BE-2",
    project: backendProject,
    assignee: owner,
    tags: [featureTag]
  });

  const task3 = taskRepo.create({
    title: "Fix token expiry bug",
    description: "Access tokens are not expiring correctly in production",
    status: TaskStatus.IN_PROGRESS,
    taskNumber: 3,
    key: "BE-3",
    project: backendProject,
    assignee: member,
    tags: [bugTag, urgentTag]
  });

  const task4 = taskRepo.create({
    title: "Add rate limiting",
    description: "Rate limit auth endpoints using Redis store",
    status: TaskStatus.REVIEW,
    taskNumber: 4,
    key: "BE-4",
    project: backendProject,
    assignee: member,
    tags: [featureTag]
  });

  const task5 = taskRepo.create({
    title: "Setup React project",
    description: "Initialize with Vite and configure routing",
    status: TaskStatus.TODO,
    taskNumber: 1,
    key: "FE-1",
    project: frontendProject,
    tags: [featureTag]
  });

  const task6 = taskRepo.create({
    title: "Build login page",
    description: "Login form with validation and error handling",
    status: TaskStatus.TODO,
    taskNumber: 2,
    key: "FE-2",
    project: frontendProject,
    assignee: member,
    tags: [featureTag, urgentTag]
  });

  await taskRepo.save([task1, task2, task3, task4, task5, task6]);

  await projectRepo.save([
    { ...backendProject, lastTaskNumber: 4 },
    { ...frontendProject, lastTaskNumber: 2 }
  ]);

  console.log("✅ Seeded tasks");

  // ─── Comments ────────────────────────────────────────────
  const commentRepo = AppDataSource.getRepository(Comment);

  await commentRepo.save([
    commentRepo.create({
      content: "This is done and deployed to staging ✅",
      task: task2,
      author: owner
    }),
    commentRepo.create({
      content: "I can reproduce this on v1.2.3 — looking into it now",
      task: task3,
      author: member
    }),
    commentRepo.create({
      content: "Rate limiting looks good, just needs integration tests",
      task: task4,
      author: owner
    })
  ]);
  console.log("💬 Seeded comments");

  // ─── Done ────────────────────────────────────────────────
  console.log(`
✅ Seed complete! Here are your test credentials:

  👤 Owner
     Email:    owner@mock.com
     Password: password123
     Role:     OWNER

  👤 Member
     Email:    member@mock.com
     Password: password123
     Role:     MEMBER

  👤 Pending (not yet activated)
     Email:    pending@mock.com
     Password: password123
     Status:   isActive = false

  🏢 Organization: "Jira-clone Demo Org"
  📁 Projects: "Backend API" (BE), "Frontend App" (FE)
  🏷️  Tags: bug, feature, urgent
  `);

  await AppDataSource.destroy();
};

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

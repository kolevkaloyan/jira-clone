# Task Management API(Jira/Trello clone)

A lightweight project and task management REST API inspired by Jira and Trello. Built with Node.js, Express, TypeScript, PostgreSQL, and Redis.

---

## Tech Stack

| Layer          | Technology                            |
| -------------- | ------------------------------------- |
| Runtime        | Node.js + TypeScript                  |
| Framework      | Express.js                            |
| Database       | PostgreSQL (via Docker)               |
| ORM            | TypeORM                               |
| Cache / Queue  | Redis + BullMQ                        |
| Authentication | JWT (access + refresh token rotation) |
| Validation     | Zod                                   |
| Testing        | Jest + Testcontainers                 |
| Documentation  | Swagger UI                            |

## Features

- **JWT Authentication** — access tokens (15min) + refresh token rotation via Redis with **httpOnly** cookies
- **Role-Based Access Control** — Owner, Admin, Member roles per organization
- **Token-Based Invitations** — invite users by email; provisional accounts created automatically
- **Project Management** — create projects with optional initial tasks in a single transaction
- **Task State Transitions** — enforced status flow: todo → in_progress → review → done
- **Background Jobs** — daily digest, cleanup of expired sessions via BullMQ
- **Audit Logging** — tracks who changed what across the system
- **Pagination & Filtering** — pagination and status filtering on tasks
- **Rate Limiting** — Rate limiting middleware for auth endpoints
- **Swagger Docs** — interactive API documentation at **/api-docs**

## Getting Started

### Prerequisites

- Node.js 18+
- Docker + Docker Compose

### 1. Clone the repository

```bash
git clone https://github.com/kolevkaloyan/jira-clone.git
cd jira-clone
```

### 2. Install all dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

### 4. Start the database and Redis

```bash
docker-compose up -d
```

### 5. Run migrations

```bash
npm run db:push
```

### 6. Seed the database

```bash
npm run seed
```

This creates the following test accounts:

| Email            | Password    | Role                   |
| ---------------- | ----------- | ---------------------- |
| owner@mock.com   | password123 | Owner                  |
| member@mock.com  | password123 | Member                 |
| pending@mock.com | password123 | Inactive (provisional) |

---

## 7. Start the server

```bash
# Terminal 1 — API server
npm run dev

# Terminal 2 — Background workers
npm run worker
```

---

## API Documentation

Swagger UI is available at:

```
http://localhost:3000/api-docs
```

---

## Background Jobs

Jobs are powered by BullMQ with Redis as the queue backend.

| Job          | Schedule         | Description                                       |
| ------------ | ---------------- | ------------------------------------------------- |
| Daily Digest | Every day at 8am | Sends task summary to all active users (mocked)   |
| Cleanup      | Every hour       | Removes expired provisional accounts and sessions |

### Trigger jobs manually

```bash
npx ts-node src/jobs/trigger.ts
```

## Running Tests

```bash
# Unit tests only (no DB required)
npm run test:unit

# Integration tests (spins up Postgres via Testcontainers)
npm run test:integration

# All tests
npm test
```

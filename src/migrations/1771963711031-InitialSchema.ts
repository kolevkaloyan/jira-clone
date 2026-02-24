import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1771963711031 implements MigrationInterface {
    name = 'InitialSchema1771963711031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid, "action" character varying NOT NULL, "entityName" character varying NOT NULL, "entityId" uuid, "before" jsonb, "after" jsonb, "diff" jsonb, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c69efb19bf127c97e6740ad530" ON "audit_logs" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_fb75d9e4b0438ff85e7294ceb8" ON "audit_logs" ("entityName") `);
        await queryRunner.query(`CREATE INDEX "IDX_cfa83f61e4d27a87fcae1e025a" ON "audit_logs" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."user_organizations_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TYPE "public"."user_organizations_status_enum" AS ENUM('pending', 'accepted', 'rejected')`);
        await queryRunner.query(`CREATE TABLE "user_organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role" "public"."user_organizations_role_enum" NOT NULL DEFAULT 'member', "status" "public"."user_organizations_status_enum" NOT NULL DEFAULT 'pending', "userId" uuid, "organizationId" uuid, CONSTRAINT "PK_51ed3f60fdf013ee5041d2d4d3d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "color" character varying NOT NULL DEFAULT 'grey', "organizationId" uuid, CONSTRAINT "UQ_826dc0fa70d58e5673cf1de946f" UNIQUE ("name", "organizationId"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "taskId" uuid, "authorId" uuid, CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tasks_status_enum" AS ENUM('todo', 'in_progress', 'review', 'done')`);
        await queryRunner.query(`CREATE TABLE "tasks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "taskNumber" integer NOT NULL, "key" character varying NOT NULL, "title" character varying NOT NULL, "description" text, "status" "public"."tasks_status_enum" NOT NULL DEFAULT 'todo', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "projectId" uuid, "assigneeId" uuid, CONSTRAINT "PK_8d12ff38fcc62aaba2cab748772" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c0abf6686e93b2a6497e0cdc22" ON "tasks" ("key") `);
        await queryRunner.query(`CREATE TABLE "project" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "key" character varying(12) NOT NULL, "description" character varying, "lastTaskNumber" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "organizationId" uuid, CONSTRAINT "PK_4d68b1358bb5b766d3e78f32f57" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "organizations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_9b7ca6d30b94fef571cff876884" UNIQUE ("name"), CONSTRAINT "PK_6b031fcd0863e3f6b44230163f9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('owner', 'admin', 'member')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "fullName" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'member', "isActive" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "tasks_tags_tags" ("tasksId" uuid NOT NULL, "tagsId" uuid NOT NULL, CONSTRAINT "PK_e2c842b1d58e16e3e4ab1b8cbba" PRIMARY KEY ("tasksId", "tagsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_791bc3e522e77386d2186ec760" ON "tasks_tags_tags" ("tasksId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8f2ff7a27728781da1a1f944f7" ON "tasks_tags_tags" ("tagsId") `);
        await queryRunner.query(`CREATE TABLE "users_organization_organizations" ("usersId" uuid NOT NULL, "organizationsId" uuid NOT NULL, CONSTRAINT "PK_0ef7c40291e93d4a4581992cef0" PRIMARY KEY ("usersId", "organizationsId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5022dc4b9ab5da28e9e262a2ca" ON "users_organization_organizations" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_fa69df9a0be1b56bfb5f7bdae6" ON "users_organization_organizations" ("organizationsId") `);
        await queryRunner.query(`ALTER TABLE "user_organizations" ADD CONSTRAINT "FK_11d4cd5202bd8914464f4bec379" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_organizations" ADD CONSTRAINT "FK_71997faba4726730e91d514138e" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tags" ADD CONSTRAINT "FK_94485bb2eb7f56ef8b787816607" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_9adf2d3106c6dc87d6262ccadfe" FOREIGN KEY ("taskId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4548cc4a409b8651ec75f70e280" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "FK_9a16d2c86252529f622fa53f1e3" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "project" ADD CONSTRAINT "FK_0028dfadf312a1d7f51656c4a9a" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tasks_tags_tags" ADD CONSTRAINT "FK_791bc3e522e77386d2186ec7604" FOREIGN KEY ("tasksId") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "tasks_tags_tags" ADD CONSTRAINT "FK_8f2ff7a27728781da1a1f944f78" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users_organization_organizations" ADD CONSTRAINT "FK_5022dc4b9ab5da28e9e262a2ca7" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_organization_organizations" ADD CONSTRAINT "FK_fa69df9a0be1b56bfb5f7bdae6a" FOREIGN KEY ("organizationsId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_organization_organizations" DROP CONSTRAINT "FK_fa69df9a0be1b56bfb5f7bdae6a"`);
        await queryRunner.query(`ALTER TABLE "users_organization_organizations" DROP CONSTRAINT "FK_5022dc4b9ab5da28e9e262a2ca7"`);
        await queryRunner.query(`ALTER TABLE "tasks_tags_tags" DROP CONSTRAINT "FK_8f2ff7a27728781da1a1f944f78"`);
        await queryRunner.query(`ALTER TABLE "tasks_tags_tags" DROP CONSTRAINT "FK_791bc3e522e77386d2186ec7604"`);
        await queryRunner.query(`ALTER TABLE "project" DROP CONSTRAINT "FK_0028dfadf312a1d7f51656c4a9a"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_9a16d2c86252529f622fa53f1e3"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "FK_e08fca67ca8966e6b9914bf2956"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4548cc4a409b8651ec75f70e280"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_9adf2d3106c6dc87d6262ccadfe"`);
        await queryRunner.query(`ALTER TABLE "tags" DROP CONSTRAINT "FK_94485bb2eb7f56ef8b787816607"`);
        await queryRunner.query(`ALTER TABLE "user_organizations" DROP CONSTRAINT "FK_71997faba4726730e91d514138e"`);
        await queryRunner.query(`ALTER TABLE "user_organizations" DROP CONSTRAINT "FK_11d4cd5202bd8914464f4bec379"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fa69df9a0be1b56bfb5f7bdae6"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5022dc4b9ab5da28e9e262a2ca"`);
        await queryRunner.query(`DROP TABLE "users_organization_organizations"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8f2ff7a27728781da1a1f944f7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_791bc3e522e77386d2186ec760"`);
        await queryRunner.query(`DROP TABLE "tasks_tags_tags"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "organizations"`);
        await queryRunner.query(`DROP TABLE "project"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c0abf6686e93b2a6497e0cdc22"`);
        await queryRunner.query(`DROP TABLE "tasks"`);
        await queryRunner.query(`DROP TYPE "public"."tasks_status_enum"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "tags"`);
        await queryRunner.query(`DROP TABLE "user_organizations"`);
        await queryRunner.query(`DROP TYPE "public"."user_organizations_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_organizations_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cfa83f61e4d27a87fcae1e025a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fb75d9e4b0438ff85e7294ceb8"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c69efb19bf127c97e6740ad530"`);
        await queryRunner.query(`DROP TABLE "audit_logs"`);
    }

}

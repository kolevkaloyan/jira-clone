import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { requireEnv } from "./utils/requireEnv";
import { AuditSubscriber } from "./subscribers/AuditSubscriber";

dotenv.config();
export const AppDataSource = new DataSource({
  type: "postgres",
  host: requireEnv("DB_HOST"),
  port: parseInt(requireEnv("DB_PORT")),
  username: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  synchronize: false,
  logging: true,
  entities: [__dirname + "/entities/*.{ts,js}"],
  migrations: [__dirname + "/migrations/*.ts"],
  subscribers: [AuditSubscriber]
});

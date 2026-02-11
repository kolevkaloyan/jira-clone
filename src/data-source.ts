import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { requireEnv } from "./utils/requireEnv";

dotenv.config();
export const AppDataSource = new DataSource({
  type: "postgres",
  host: requireEnv("DB_HOST"),
  port: parseInt(requireEnv("DB_PORT")),
  username: requireEnv("DB_USER"),
  password: requireEnv("DB_PASSWORD"),
  database: requireEnv("DB_NAME"),
  synchronize: true, // Always false in production; use migrations instead!
  logging: true,
  entities: [__dirname + "/entities/*.ts"],
  migrations: [__dirname + "/migrations/*.ts"],
  subscribers: []
});

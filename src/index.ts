import "reflect-metadata";
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { AppDataSource } from "./data-source";
import { requireEnv } from "./utils/requireEnv";
import { startScheduler } from "./jobs/scheduler";
import "./jobs/workers/dailyDigestWorker";
import "./jobs/workers/cleanupWorker";

const PORT = requireEnv("PORT");

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected via TypeORM");

    await startScheduler();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}/api/v1`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Fatal Error during server startup:", error);
    process.exit(1);
  }
};

startServer();

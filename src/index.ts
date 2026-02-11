import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./data-source";
import { requireEnv } from "./utils/requireEnv";

dotenv.config();

const PORT = requireEnv("PORT");

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("✅ Database connected via TypeORM");

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

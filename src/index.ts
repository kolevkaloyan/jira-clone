import { AppDataSource } from "./data-source";

AppDataSource.initialize()
  .then(() => {
    console.log("🚀 Database connected successfully");
    // Start your Express server here
  })
  .catch((error) => console.log("❌ Database connection failed:", error));

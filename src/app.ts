import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rootRouter from "./routes/index";
import { globalErrorHandler } from "./middleware/error.middleware";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";

const app: Application = express();

/**
 Global Middleware
 */
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(cookieParser());

/**
 API Versioning
 */
app.use("/api/v1", rootRouter);

/**
 Health Check
*/
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "UP", timestamp: new Date().toISOString() });
});

/*
Swagger Docs
*/
if (process.env.NODE_ENV !== "production") {
  const swaggerOutput = require("../swagger-output.json");
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOutput));
}

/*
Custom error handling
*/
app.use(globalErrorHandler);

export default app;

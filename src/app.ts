import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rootRouter from "./routes/index";

const app: Application = express();

/**
 Global Middleware
 */
app.use(helmet());
app.use(cors());
app.use(express.json());

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

export default app;

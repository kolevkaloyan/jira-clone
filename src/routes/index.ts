import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import orgRoutes from "./organization.routes";
import projectRoutes from "./project.routes";

const rootRouter = Router();

rootRouter.use("/auth", authRoutes);

rootRouter.use("/user", userRoutes);

rootRouter.use("/organization", orgRoutes);

export default rootRouter;

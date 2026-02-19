import { Request, Response, NextFunction } from "express";
import { v4 as uuid } from "uuid";
import { requestContext } from "../utils/requestContext";

export const requestContextMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  requestContext.run(
    {
      userId: req.user?.id,
      requestId: uuid()
    },
    () => next()
  );
};

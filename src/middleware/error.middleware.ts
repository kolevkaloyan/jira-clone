import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation Error";
    return res.status(statusCode).json({
      status: "error",
      message,
      errors: err.issues.map((e: any) => ({ path: e.path, message: e.message }))
    });
  }

  // Handle typeORM unique constraint
  if (err.code === "23505") {
    statusCode = 409;
    message = "Duplicate field value entered";
  }

  res.status(statusCode).json({
    status: statusCode === 500 ? "fail" : "error",
    message
    // ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

import { Request, Response, NextFunction } from "express";

//Automatically forward errors to the GlobalEventHandler to avoid try catch blocks

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

import { Request, Response, NextFunction } from "express";

export const validationMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Placeholder for validation logic
  // Could use libraries like Joi or express-validator
  next();
};

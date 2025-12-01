import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError, ValidationError } from "@/utils/errors.js";
import type { ApiResponse } from "@/types/index.js";

export function errorHandler(
  err: Error | AppError | ZodError,
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  console.error("Error:", err);

  let statusCode = 500;
  let message = "Internal server error";
  let code = "INTERNAL_ERROR";
  let details: any = undefined;

  if (err instanceof ZodError) {
    statusCode = 400;
    message = "Validation error";
    code = "VALIDATION_ERROR";
    details = err.errors;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code || "ERROR";
    details = err.details;
  } else if (err instanceof Error) {
    message = err.message;
  }

  const response: ApiResponse = {
    success: false,
    error: {
      message,
      code,
      ...(details && { details }),
    },
  };

  res.status(statusCode).json(response);
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

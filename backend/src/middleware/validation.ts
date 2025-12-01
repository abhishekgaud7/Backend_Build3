import type { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { ValidationError } from "@/utils/errors.js";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          "Invalid request body",
          JSON.parse(error.message),
        );
      }
      throw new ValidationError("Invalid request body");
    }
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          "Invalid query parameters",
          JSON.parse(error.message),
        );
      }
      throw new ValidationError("Invalid query parameters");
    }
  };
}

export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof Error) {
        throw new ValidationError(
          "Invalid parameters",
          JSON.parse(error.message),
        );
      }
      throw new ValidationError("Invalid parameters");
    }
  };
}

import type { Request, Response, NextFunction } from "express";
import { verifyToken, extractTokenFromHeader } from "@/utils/auth.js";
import { AuthenticationError } from "@/utils/errors.js";
import type { AuthenticatedRequest } from "@/types/index.js";

export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw new AuthenticationError("No authorization token provided");
    }

    const payload = verifyToken(token);
    if (!payload) {
      throw new AuthenticationError("Invalid or expired token");
    }

    req.user = {
      id: payload.userId,
      email: payload.email,
      role: payload.role as "BUYER" | "SELLER" | "ADMIN",
    };

    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      throw error;
    }
    throw new AuthenticationError("Authentication failed");
  }
}

export function requireRole(...roles: string[]) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): void => {
    if (!req.user) {
      throw new AuthenticationError("User not authenticated");
    }

    if (!roles.includes(req.user.role)) {
      throw new AuthenticationError("Insufficient permissions");
    }

    next();
  };
}

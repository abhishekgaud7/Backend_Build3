import type { Response, NextFunction } from "express";
import { extractTokenFromHeader } from "@/utils/auth.js";
import { supabase } from "@/lib/supabase.js";
import { prisma } from "@/lib/prisma.js";
import { AuthenticationError } from "@/utils/errors.js";
import type { AuthenticatedRequest } from "@/types/index.js";

export async function authMiddleware(
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);
    if (!token) {
      throw new AuthenticationError("No authorization token provided");
    }

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new AuthenticationError("Invalid or expired token");
    }

    const dbUser = await prisma.user.findUnique({
      where: { email: data.user.email! },
    });
    if (!dbUser) {
      throw new AuthenticationError("User profile not found");
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role as "BUYER" | "SELLER" | "ADMIN",
    };
    next();
  } catch (err) {
    return next(
      err instanceof AuthenticationError
        ? err
        : new AuthenticationError("Authentication failed"),
    );
  }
}

export function requireRole(...roles: string[]) {
  return (
    req: AuthenticatedRequest,
    _res: Response,
    next: NextFunction,
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

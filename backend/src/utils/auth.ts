import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import type { JWTPayload } from "@/types/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "1h";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(
  userId: string,
  email: string,
  role: string,
): string {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRY,
    },
  );
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function extractTokenFromHeader(authHeader?: string): string | null {
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    return null;
  }
  return parts[1];
}

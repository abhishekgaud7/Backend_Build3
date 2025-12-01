import { prisma } from "@/lib/prisma.js";
import {
  hashPassword,
  verifyPassword,
  generateToken,
} from "@/utils/auth.js";
import {
  AuthenticationError,
  ConflictError,
  NotFoundError,
} from "@/utils/errors.js";
import type { UserProfile } from "@/types/index.js";

interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  role: "BUYER" | "SELLER";
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResponse {
  user: UserProfile;
  accessToken: string;
}

export async function registerUser(input: RegisterInput): Promise<AuthResponse> {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingUser) {
    throw new ConflictError("Email already registered");
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Create user
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
      passwordHash,
    },
  });

  // Generate token
  const accessToken = generateToken(user.id, user.email, user.role);

  return {
    user: formatUserProfile(user),
    accessToken,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Verify password
  const isPasswordValid = await verifyPassword(
    input.password,
    user.passwordHash
  );

  if (!isPasswordValid) {
    throw new AuthenticationError("Invalid email or password");
  }

  // Generate token
  const accessToken = generateToken(user.id, user.email, user.role);

  return {
    user: formatUserProfile(user),
    accessToken,
  };
}

export async function getCurrentUser(userId: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError("User");
  }

  return formatUserProfile(user);
}

export async function updateUserProfile(
  userId: string,
  input: { name?: string; phone?: string }
): Promise<UserProfile> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.phone && { phone: input.phone }),
    },
  });

  return formatUserProfile(user);
}

function formatUserProfile(user: any): UserProfile {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
  };
}

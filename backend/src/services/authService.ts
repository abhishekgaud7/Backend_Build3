import { prisma } from "@/lib/prisma.js";
import { supabase } from "@/lib/supabase.js";
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

export async function registerUser(
  input: RegisterInput,
): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
  });

  if (error) {
    if (error.message.includes("already registered") || error.status === 400) {
      throw new ConflictError("Email already registered");
    }
    throw new AuthenticationError(error.message);
  }

  const supabaseUser = data.user;
  if (!supabaseUser) {
    throw new AuthenticationError("Registration failed");
  }

  const user = await prisma.user.create({
    data: {
      id: supabaseUser.id,
      name: input.name,
      email: input.email,
      phone: input.phone,
      role: input.role,
    },
  });

  const accessToken = data.session?.access_token ?? "";

  return { user: formatUserProfile(user), accessToken };
}

export async function loginUser(input: LoginInput): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  });

  if (error || !data.session) {
    throw new AuthenticationError("Invalid email or password");
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new NotFoundError("User");
  }

  return { user: formatUserProfile(user), accessToken: data.session.access_token };
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
  input: { name?: string; phone?: string },
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

import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { authMiddleware } from "@/middleware/auth.js";
import { validateBody } from "@/middleware/validation.js";
import {
  RegisterRequestSchema,
  LoginSchema,
  UpdateProfileSchema,
} from "@/schemas/index.js";
import {
  registerUser,
  loginUser,
  getCurrentUser,
  updateUserProfile,
} from "@/services/authService.js";
import type { AuthenticatedRequest } from "@/types/index.js";
import type { Response } from "express";
import type { ApiResponse } from "@/types/index.js";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  validateBody(RegisterRequestSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await registerUser(req.body);
    const response: ApiResponse = {
      success: true,
      data: result,
    };
    res.status(201).json(response);
  })
);

// POST /api/auth/login
router.post(
  "/login",
  validateBody(LoginSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await loginUser(req.body);
    const response: ApiResponse = {
      success: true,
      data: result,
    };
    res.json(response);
  })
);

// POST /api/auth/logout
router.post(
  "/logout",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: { message: "Logged out successfully" },
    };
    res.json(response);
  })
);

// GET /api/auth/me
router.get(
  "/me",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const user = await getCurrentUser(req.user.id);
    const response: ApiResponse = {
      success: true,
      data: user,
    };
    res.json(response);
  })
);

export default router;

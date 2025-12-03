import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { authMiddleware } from "@/middleware/auth.js";
import { validateBody } from "@/middleware/validation.js";
import { RegisterRequestSchema, LoginSchema } from "@/schemas/index.js";
import { registerUser, loginUser, getCurrentUser } from "@/services/authService.js";
import type { AuthenticatedRequest } from "@/types/index.js";
import type { Response } from "express";
import type { ApiResponse } from "@/types/index.js";

const router = Router();

// POST /api/auth/register
router.post(
  "/register",
  validateBody(RegisterRequestSchema),
  asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const result = await registerUser(_req.body);
    const response: ApiResponse = {
      success: true,
      data: result,
    };
    return res.status(201).json(response);
  }),
);

// POST /api/auth/login
router.post(
  "/login",
  validateBody(LoginSchema),
  asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const result = await loginUser(_req.body);
    const response: ApiResponse = {
      success: true,
      data: result,
    };
    return res.json(response);
  }),
);

// POST /api/auth/logout
router.post(
  "/logout",
  asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: { message: "Logged out successfully" },
    };
    return res.json(response);
  }),
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
    return res.json(response);
  }),
);

export default router;

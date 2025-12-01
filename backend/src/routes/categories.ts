import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { authMiddleware, requireRole } from "@/middleware/auth.js";
import { validateBody } from "@/middleware/validation.js";
import { CategorySchema } from "@/schemas/index.js";
import {
  createCategory,
  getCategories,
  getCategoryBySlug,
  updateCategory,
  deleteCategory,
} from "@/services/categoryService.js";
import type { AuthenticatedRequest } from "@/types/index.js";
import type { Response } from "express";
import type { ApiResponse } from "@/types/index.js";

const router = Router();

// GET /api/categories
router.get(
  "/",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const categories = await getCategories();
    const response: ApiResponse = {
      success: true,
      data: categories,
    };
    res.json(response);
  }),
);

// GET /api/categories/:slug
router.get(
  "/:slug",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = await getCategoryBySlug(req.params.slug);
    const response: ApiResponse = {
      success: true,
      data: category,
    };
    res.json(response);
  }),
);

// POST /api/categories (admin only)
router.post(
  "/",
  authMiddleware,
  requireRole("ADMIN"),
  validateBody(CategorySchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = await createCategory(req.body);
    const response: ApiResponse = {
      success: true,
      data: category,
    };
    res.status(201).json(response);
  }),
);

// PUT /api/categories/:id (admin only)
router.put(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  validateBody(CategorySchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const category = await updateCategory(req.params.id, req.body);
    const response: ApiResponse = {
      success: true,
      data: category,
    };
    res.json(response);
  }),
);

// DELETE /api/categories/:id (admin only)
router.delete(
  "/:id",
  authMiddleware,
  requireRole("ADMIN"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    await deleteCategory(req.params.id);
    const response: ApiResponse = {
      success: true,
      data: { message: "Category deleted successfully" },
    };
    res.json(response);
  }),
);

export default router;

import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { authMiddleware, requireRole } from "@/middleware/auth.js";
import { validateBody, validateQuery } from "@/middleware/validation.js";
import {
  CreateProductSchema,
  UpdateProductSchema,
  ProductsQuerySchema,
} from "@/schemas/index.js";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
  getProducts,
  getSellerProducts,
} from "@/services/productService.js";
import type { AuthenticatedRequest } from "@/types/index.js";
import type { Response } from "express";
import type { ApiResponse, PaginatedResponse } from "@/types/index.js";

const router = Router();

// GET /api/products
router.get(
  "/",
  validateQuery(ProductsQuerySchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const search = req.query.search as string | undefined;
    const categorySlug = req.query.categorySlug as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { products, total } = await getProducts(
      search,
      categorySlug,
      page,
      limit
    );

    const response: PaginatedResponse = {
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
    res.json(response);
  })
);

// GET /api/products/:id
router.get(
  "/:id",
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const product = await getProduct(req.params.id);
    const response: ApiResponse = {
      success: true,
      data: product,
    };
    res.json(response);
  })
);

// POST /api/products
router.post(
  "/",
  authMiddleware,
  requireRole("SELLER", "ADMIN"),
  validateBody(CreateProductSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const product = await createProduct(req.user.id, req.body);
    const response: ApiResponse = {
      success: true,
      data: product,
    };
    res.status(201).json(response);
  })
);

// PUT /api/products/:id
router.put(
  "/:id",
  authMiddleware,
  requireRole("SELLER", "ADMIN"),
  validateBody(UpdateProductSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const product = await updateProduct(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body
    );
    const response: ApiResponse = {
      success: true,
      data: product,
    };
    res.json(response);
  })
);

// DELETE /api/products/:id
router.delete(
  "/:id",
  authMiddleware,
  requireRole("SELLER", "ADMIN"),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    await deleteProduct(req.params.id, req.user.id, req.user.role);
    const response: ApiResponse = {
      success: true,
      data: { message: "Product deleted successfully" },
    };
    res.json(response);
  })
);

export default router;

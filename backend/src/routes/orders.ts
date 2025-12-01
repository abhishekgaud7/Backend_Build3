import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { authMiddleware, requireRole } from "@/middleware/auth.js";
import { validateBody, validateQuery } from "@/middleware/validation.js";
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  PaginationSchema,
} from "@/schemas/index.js";
import {
  createOrder,
  getOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
} from "@/services/orderService.js";
import type { AuthenticatedRequest } from "@/types/index.js";
import type { Response } from "express";
import type { ApiResponse, PaginatedResponse } from "@/types/index.js";

const router = Router();

// GET /api/orders
router.get(
  "/",
  authMiddleware,
  validateQuery(PaginationSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    let result;
    if (req.user.role === "ADMIN") {
      result = await getAllOrders(page, limit);
    } else {
      result = await getUserOrders(req.user.id, page, limit);
    }

    const response: PaginatedResponse = {
      success: true,
      data: result.orders,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
    res.json(response);
  })
);

// GET /api/orders/:id
router.get(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const order = await getOrder(req.params.id, req.user.id, req.user.role);
    const response: ApiResponse = {
      success: true,
      data: order,
    };
    res.json(response);
  })
);

// POST /api/orders
router.post(
  "/",
  authMiddleware,
  validateBody(CreateOrderSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    // Convert string quantities to numbers
    const items = req.body.items.map((item: any) => ({
      productId: item.productId,
      quantity: parseInt(item.quantity),
    }));

    const order = await createOrder(req.user.id, {
      ...req.body,
      items,
    });

    const response: ApiResponse = {
      success: true,
      data: order,
    };
    res.status(201).json(response);
  })
);

// PUT /api/orders/:id/status
router.put(
  "/:id/status",
  authMiddleware,
  requireRole("ADMIN", "SELLER"),
  validateBody(UpdateOrderStatusSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const order = await updateOrderStatus(
      req.params.id,
      req.body.status,
      req.user.role
    );
    const response: ApiResponse = {
      success: true,
      data: order,
    };
    res.json(response);
  })
);

export default router;

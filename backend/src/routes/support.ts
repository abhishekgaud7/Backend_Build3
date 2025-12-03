import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { authMiddleware, requireRole } from "@/middleware/auth.js";
import { validateBody, validateQuery } from "@/middleware/validation.js";
import {
  CreateSupportTicketSchema,
  CreateSupportMessageSchema,
  UpdateSupportTicketSchema,
  PaginationSchema,
} from "@/schemas/index.js";
import {
  createTicket,
  getTicket,
  getUserTickets,
  getAllTickets,
  updateTicketStatus,
  addMessage,
} from "@/services/supportService.js";
import type { AuthenticatedRequest } from "@/types/index.js";
import type { Response } from "express";
import type { ApiResponse, PaginatedResponse } from "@/types/index.js";

const router = Router();

// GET /api/support
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
      result = await getAllTickets(page, limit);
    } else {
      result = await getUserTickets(req.user.id, page, limit);
    }

    const response: PaginatedResponse = {
      success: true,
      data: result.tickets,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    };
    return res.json(response);
  }),
);

// GET /api/support/:id
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

    const ticket = await getTicket(req.params.id, req.user.id, req.user.role);
    const response: ApiResponse = {
      success: true,
      data: ticket,
    };
    return res.json(response);
  }),
);

// POST /api/support
router.post(
  "/",
  authMiddleware,
  validateBody(CreateSupportTicketSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const ticket = await createTicket(req.user.id, req.body);
    const response: ApiResponse = {
      success: true,
      data: ticket,
    };
    return res.status(201).json(response);
  }),
);

// POST /api/support/:id/messages
router.post(
  "/:id/messages",
  authMiddleware,
  validateBody(CreateSupportMessageSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const message = await addMessage(
      req.params.id,
      req.user.id,
      req.user.role,
      req.body,
    );
    const response: ApiResponse = {
      success: true,
      data: message,
    };
    return res.status(201).json(response);
  }),
);

// PUT /api/support/:id/status
router.put(
  "/:id/status",
  authMiddleware,
  requireRole("ADMIN"),
  validateBody(UpdateSupportTicketSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const ticket = await updateTicketStatus(
      req.params.id,
      req.body.status,
      req.user.role,
    );
    const response: ApiResponse = {
      success: true,
      data: ticket,
    };
    return res.json(response);
  }),
);

export default router;

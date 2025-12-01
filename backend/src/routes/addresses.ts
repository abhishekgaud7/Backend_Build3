import { Router } from "express";
import { asyncHandler } from "@/middleware/errorHandler.js";
import { authMiddleware } from "@/middleware/auth.js";
import { validateBody } from "@/middleware/validation.js";
import {
  CreateAddressSchema,
  UpdateAddressSchema,
} from "@/schemas/index.js";
import {
  createAddress,
  getAddress,
  getUserAddresses,
  updateAddress,
  deleteAddress,
} from "@/services/addressService.js";
import type { AuthenticatedRequest } from "@/types/index.js";
import type { Response } from "express";
import type { ApiResponse } from "@/types/index.js";

const router = Router();

// GET /api/addresses
router.get(
  "/",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const addresses = await getUserAddresses(req.user.id);
    const response: ApiResponse = {
      success: true,
      data: addresses,
    };
    res.json(response);
  })
);

// GET /api/addresses/:id
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

    const address = await getAddress(req.params.id, req.user.id);
    const response: ApiResponse = {
      success: true,
      data: address,
    };
    res.json(response);
  })
);

// POST /api/addresses
router.post(
  "/",
  authMiddleware,
  validateBody(CreateAddressSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const address = await createAddress(req.user.id, req.body);
    const response: ApiResponse = {
      success: true,
      data: address,
    };
    res.status(201).json(response);
  })
);

// PUT /api/addresses/:id
router.put(
  "/:id",
  authMiddleware,
  validateBody(UpdateAddressSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    const address = await updateAddress(req.params.id, req.user.id, req.body);
    const response: ApiResponse = {
      success: true,
      data: address,
    };
    res.json(response);
  })
);

// DELETE /api/addresses/:id
router.delete(
  "/:id",
  authMiddleware,
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: "Not authenticated" },
      });
    }

    await deleteAddress(req.params.id, req.user.id);
    const response: ApiResponse = {
      success: true,
      data: { message: "Address deleted successfully" },
    };
    res.json(response);
  })
);

export default router;

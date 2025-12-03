import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler, asyncHandler } from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import categoryRoutes from "./routes/categories.js";
import orderRoutes from "./routes/orders.js";
import addressRoutes from "./routes/addresses.js";
import supportRoutes from "./routes/support.js";
import type { Response } from "express";
import type { ApiResponse } from "./types/index.js";

export function createApp() {
  const app = express();
  const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

  app.use(express.json());
  app.use(
    cors({
      origin: CORS_ORIGIN,
      credentials: true,
    }),
  );

  app.get(
    "/api/health",
    asyncHandler(async (_req, res: Response) => {
      const response: ApiResponse = {
        success: true,
        data: { message: "Server is running" },
      };
      res.json(response);
    }),
  );

  app.get(
    "/",
    asyncHandler(async (_req, res: Response) => {
      res.json({ message: "BUILD-SETU API", base: "/api", health: "/api/health" });
    }),
  );
  app.get(
    "/api",
    asyncHandler(async (_req, res: Response) => {
      res.json({ ok: true, health: "/api/health" });
    }),
  );

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/categories", categoryRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/addresses", addressRoutes);
  app.use("/api/support", supportRoutes);

  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { message: "Route not found", code: "NOT_FOUND" },
    });
  });

  app.use(errorHandler);

  return app;
}


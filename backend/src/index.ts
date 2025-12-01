import "dotenv/config";
import express from "express";
import cors from "cors";
import { errorHandler, asyncHandler } from "@/middleware/errorHandler.js";
import authRoutes from "@/routes/auth.js";
import productRoutes from "@/routes/products.js";
import categoryRoutes from "@/routes/categories.js";
import orderRoutes from "@/routes/orders.js";
import addressRoutes from "@/routes/addresses.js";
import supportRoutes from "@/routes/support.js";
import type { Response } from "express";
import type { ApiResponse } from "@/types/index.js";

const app = express();
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

// Health check endpoint
app.get(
  "/api/health",
  asyncHandler(async (req, res: Response) => {
    const response: ApiResponse = {
      success: true,
      data: { message: "Server is running" },
    };
    res.json(response);
  })
);

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/support", supportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Route not found",
      code: "NOT_FOUND",
    },
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 API base URL: http://localhost:${PORT}/api`);
  console.log(`🔒 CORS origin: ${CORS_ORIGIN}`);
});

export default app;

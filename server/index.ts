import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Health and root info for serverless
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { message: "Serverless is running" } });
  });
  app.get("/", (_req, res) => {
    res.json({ message: "BUILD-SETU Serverless API", base: "/api", health: "/api/health" });
  });
  app.get("/api", (_req, res) => {
    res.json({ ok: true, health: "/api/health" });
  });

  return app;
}

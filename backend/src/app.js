import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoSanitize from "express-mongo-sanitize";

import { isDbConnected } from "./config/db.js";
import { apiLimiter } from "./middleware/rateLimit.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import donneurRoutes from "./routes/donneurRoutes.js";
import hopitalRoutes from "./routes/hopitalRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import statsRoutes from "./routes/statsRoutes.js";

/**
 * Builds the Express app (no DB connection / no listen here) so it can be
 * imported directly by tests with supertest.
 */
export function createApp() {
  const app = express();
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

  app.set("trust proxy", 1);

  // ----- Security & parsing -----
  app.use(helmet());
  app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
  app.use(express.json({ limit: "100kb" }));
  app.use(mongoSanitize()); // strips $ / . keys → blocks NoSQL injection
  if (process.env.NODE_ENV !== "test") app.use(morgan("dev"));

  // ----- Health -----
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", db: isDbConnected() ? "connected" : "down" });
  });

  // ----- API routes -----
  app.use("/api", apiLimiter);
  app.use("/api/auth", authRoutes);
  app.use("/api/donneur", donneurRoutes);
  app.use("/api/hopital", hopitalRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/stats", statsRoutes);

  // ----- Fallbacks -----
  app.use("/api", notFound);
  app.use(errorHandler);

  return app;
}

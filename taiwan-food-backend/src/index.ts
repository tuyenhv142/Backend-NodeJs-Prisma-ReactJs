import { config } from "dotenv";
config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import path from "path";

import { buildSwaggerSpec } from "./swagger";
import { requestId } from "./core/requestId";
import { errorHandler } from "./core/errorHandler";
import { initVideoCronJob } from "./helpers/videoHelper";
import { prisma } from "./prisma/client";
import { logger } from "./core/logger";

import authRoutes from "./routes/authRoute";
import restaurantRoutes from "./routes/restaurantRoute";
import youtubeRoutes from "./routes/youtubeRoute";

const app = express();
const PORT = parseInt(process.env.PORT ?? "8765", 10);
const HOST = process.env.HOST ?? "0.0.0.0";

// ── Security ──────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === "production" ? undefined : false,
}));
const corsOrigin = process.env.CORS_ORIGIN || "*";
app.use(cors({
  origin: corsOrigin,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: corsOrigin !== "*",
}));

// ── Core ──────────────────────────────────────────
app.use(requestId);
app.use(express.json());

// ── Swagger (cache spec) — phải đặt trước rate limiter ──
const swaggerSpec = buildSwaggerSpec();
app.use("/api-docs", swaggerUi.serve, (_req: any, res: any) => {
  res.send(swaggerUi.generateHTML(swaggerSpec));
});

// ── Rate limiter — chỉ áp dụng cho API, không ảnh hưởng /api-docs ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Too many requests, please try again later" },
});
app.use("/api/", limiter);

// ── Routes ────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/youtube", youtubeRoutes);

// ── Frontend static ───────────────────────────────
const frontendPath = path.join(__dirname, "../dist_frontend");
app.use(express.static(frontendPath));
app.get(/^(?!\/api).*/, (_req, res) => {
  res.sendFile("index.html", { root: frontendPath });
});

// ── Error handler (phải đặt cuối) ─────────────────
app.use(errorHandler);

// ── Cron jobs ─────────────────────────────────────
initVideoCronJob("video", 10);

// ── Start server ──────────────────────────────────
const server = app.listen(PORT, HOST, () => {
  logger.info(`Server running at http://${HOST}:${PORT}`, { host: HOST, port: PORT });
  logger.info(`Swagger docs: http://${HOST}:${PORT}/api-docs`);
});

// ── Graceful shutdown ─────────────────────────────
const shutdown = async () => {
  logger.info("Shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    logger.info("Server closed");
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

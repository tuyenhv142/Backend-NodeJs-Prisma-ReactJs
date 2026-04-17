import "dotenv/config";
import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";

import { buildSwaggerSpec } from "./swagger";
import authRoutes from "./routes/authRoute";
import restaurantRoutes from "./routes/restaurantRoute";
import youtubeRoutes from "./routes/youtubeRoute";
import { errorHandler } from "./middlewares/errorHandler";
import { prisma } from "./prisma/client";
import { initVideoCronJob } from "./helpers/videoHelper";
import path from "path";

const app = express();
const PORT = process.env.PORT ?? 8765;

app.use(cors());
app.use(express.json());
app.use("/api-docs", swaggerUi.serve, (req: any, res: any) => {
  res.send(swaggerUi.generateHTML(buildSwaggerSpec()));
});
app.use("/api/auth", authRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use(errorHandler); // phải đặt cuối cùng

initVideoCronJob("video", 10); // ← Khởi tạo cron job để sync video hàng ngày

//front end
const frontendPath = path.join(__dirname, "../dist_frontend");
app.use(express.static(frontendPath));

// Dùng /.*/ (Regex) thay vì '*' (String)
app.get(/^(?!\/api).*/, (req, res) => {
  // THAY ĐỔI Ở ĐÂY: Dùng tham số { root } thay vì nối chuỗi trực tiếp
  res.sendFile("index.html", { root: frontendPath });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`📖 Swagger docs: http://localhost:${PORT}/api-docs`);
});

// Đóng kết nối sạch khi tắt server
const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

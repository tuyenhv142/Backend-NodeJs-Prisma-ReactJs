import cron from "node-cron";
import { youtubeService } from "../services/youtubeService";

/**
 * Lên lịch sync video từ YouTube mỗi ngày lúc 18:00 (Asia/Taipei).
 * Chỉ khởi tạo cron job, không gọi sync ngay.
 */
export const initVideoCronJob = (type: string, maxResults: number) => {
  cron.schedule("0 18 * * *", () => {
    youtubeService.syncFromChannel(type, maxResults);
  }, {
    timezone: "Asia/Taipei",
  });
};

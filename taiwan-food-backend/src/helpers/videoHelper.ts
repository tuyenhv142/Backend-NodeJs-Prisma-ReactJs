import cron from "node-cron";
import { google } from "googleapis";
import { prisma } from "../prisma/client";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});
const idChanel = "UCSEI3nk0QSGcQKR75O6vM6Q";

// Hàm thực hiện việc lấy video và lưu vào DB
const fetchAndSaveVideos = async (type: string, maxResults: number) => {
  console.log("sync video");
  try {
    const response = await youtube.search.list({
      part: ["snippet"],
      channelId: idChanel,
      order: "date",
      maxResults: maxResults,
      type: [type],
    });

    const items = response.data.items || [];
    for (const item of items) {
      const videoId = item.id?.videoId || "unknown";
      const existingVideo = await prisma.video.findFirst({
        where: { idVideo: videoId },
      });

      if (existingVideo) {
        await prisma.video.update({
          where: { id: existingVideo.id },
          data: {
            title: item.snippet?.title || "",
            type: type,
            thumbnail: item.snippet?.thumbnails?.high?.url || "",
            updatedAt: new Date(),
          },
        });
      } else {
        await prisma.video.create({
          data: {
            idVideo: videoId,
            title: item.snippet?.title || "",
            thumbnail: item.snippet?.thumbnails?.high?.url || "",
            channel: item.snippet?.channelTitle || "",
            type: type,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    }
    console.log("Sync video successfully! Total videos synced:", items.length);
  } catch (error) {
    console.error("Error syncing videos:", error);
  }
};

export const initVideoCronJob = async (type: string, maxResults: number) => {
  // 1. Kiểm tra xem loại 'type' này đã có trong DB chưa
  const countByType = await prisma.video.count({
    where: { type: type },
  });

  // Nếu chưa có dữ liệu cho loại này, load ngay lập tức
  if (countByType === 0 || maxResults > countByType) {
    console.log(`⚠️ Chưa có dữ liệu cho kiểu [${type}]. Đang load lần đầu...`);
    await fetchAndSaveVideos(type, maxResults);
  } else {
    console.log(`ℹ️ Đã có ${countByType} mục cho kiểu [${type}].`);
  }

  // 2. Cron Job 18:00 vẫn chạy để cập nhật cái mới nhất cho type đó
  cron.schedule("0 18 * * *", () => fetchAndSaveVideos(type, maxResults), {
    timezone: "Asia/Taipei",
  });
};

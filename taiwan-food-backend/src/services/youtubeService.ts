import { google } from "googleapis";
import { prisma } from "../prisma/client";
import { logger } from "../core/logger";

const YOUTUBE_CHANNEL_ID = "UCSEI3nk0QSGcQKR75O6vM6Q";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY,
});

// ── Types ─────────────────────────────────────────
export interface VideoResult {
  id: string | null | undefined;
  title: string | null | undefined;
  thumbnail: string | null | undefined;
  channel: string | null | undefined;
}

// ── Service ───────────────────────────────────────
export const youtubeService = {
  async searchByQuery(query: string, maxResults: number): Promise<VideoResult[]> {
    const response = await youtube.search.list({
      part: ["snippet"],
      q: query,
      maxResults,
      type: ["video"],
    });

    return (
      response.data.items?.map((item) => ({
        id: item.id?.videoId,
        title: item.snippet?.title,
        thumbnail: item.snippet?.thumbnails?.high?.url,
        channel: item.snippet?.channelTitle,
      })) || []
    );
  },

  async getFromChannel(
    type: string,
    maxResults: number,
  ): Promise<VideoResult[]> {
    // Sync nếu DB chưa có dữ liệu cho type này
    const count = await prisma.video.count({ where: { type } });
    if (count === 0 || maxResults > count) {
      await syncVideosFromYouTube(type, maxResults);
    }

    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      where: { type },
      take: maxResults,
    });

    return videos.map((v: { idVideo: string; title: string; thumbnail: string | null; channel: string }) => ({
      id: v.idVideo,
      title: v.title,
      thumbnail: v.thumbnail,
      channel: v.channel,
    }));
  },

  async syncFromChannel(type: string, maxResults: number): Promise<number> {
    return syncVideosFromYouTube(type, maxResults);
  },
};

// ── Internal ──────────────────────────────────────
async function syncVideosFromYouTube(
  type: string,
  maxResults: number,
): Promise<number> {
  logger.info("Syncing videos from YouTube", { type, maxResults });

  const response = await youtube.search.list({
    part: ["snippet"],
    channelId: YOUTUBE_CHANNEL_ID,
    order: "date",
    maxResults,
    type: [type],
  });

  const items = response.data.items || [];
  for (const item of items) {
    const videoId = item.id?.videoId || "unknown";
    const existing = await prisma.video.findFirst({
      where: { idVideo: videoId },
    });

    const data = {
      title: item.snippet?.title || "",
      type,
      thumbnail: item.snippet?.thumbnails?.high?.url || "",
      updatedAt: new Date(),
    };

    if (existing) {
      await prisma.video.update({ where: { id: existing.id }, data });
    } else {
      await prisma.video.create({
        data: {
          ...data,
          idVideo: videoId,
          channel: item.snippet?.channelTitle || "",
          createdAt: new Date(),
        },
      });
    }
  }

  logger.info("Video sync complete", { count: items.length });
  return items.length;
}

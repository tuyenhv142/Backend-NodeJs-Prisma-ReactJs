import { google } from "googleapis";
import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../helpers/apiResponse";
import {
  searchYoutubeVideosSchema,
  typeYoutubeVideosSchema,
} from "../schemas/youtubeSchema";
import { prisma } from "../prisma/client";
import { initVideoCronJob } from "../helpers/videoHelper";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.YOUTUBE_API_KEY, // Lưu Key này trong file .env của Backend
});

export const getTaiwanFoodVideosByQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Lấy từ req.query thay vì req.body
    const parsed = searchYoutubeVideosSchema.safeParse(req.query);

    if (!parsed.success) {
      return sendError(
        res,
        "Invalid query parameters",
        400,
        parsed.error.flatten().fieldErrors,
      );
    }

    const response = await youtube.search.list({
      part: ["snippet"],
      q: parsed.data.query, // Bây giờ lấy từ Query string (?query=...)
      maxResults: Number(parsed.data.maxResults) || 10, // Query luôn là string nên cần ép kiểu
      type: ["video"],
    });

    const videos = response.data.items?.map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.high?.url,
      channel: item.snippet?.channelTitle,
    }));

    // const newVideo = await prisma.video.create({ data: {
    //     idVideo: videos?.[0]?.id || 'unknown',
    //     title: videos?.[0]?.title || 'unknown',
    //     thumbnail: videos?.[0]?.thumbnail || '',
    //     channel: videos?.[0]?.channel || 'unknown',
    //     createdAt: new Date(),
    //     updatedAt: new Date(),
    // } });

    sendSuccess(res, videos);
  } catch (error) {
    next(error);
  }
};

export const getTaiwanFoodVideosIdChanel = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // Get videos from database instead of YouTube API
    const parsed = typeYoutubeVideosSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(
        res,
        "Invalid query parameters",
        400,
        parsed.error.flatten().fieldErrors,
      );
    }
    await initVideoCronJob(
      parsed.data.type || "video",
      parsed.data.maxResults || 10,
    ); // ← gọi hàm này để đảm bảo video được sync trước khi lấy
    const videos = await prisma.video.findMany({
      orderBy: { createdAt: "desc" },
      where: { type: parsed.data.type || "video" },
      take: parsed.data.maxResults || 10,
    });

    return sendSuccess(res, videos);
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../helpers/apiResponse";
import { youtubeService } from "../services/youtubeService";
import {
  searchYoutubeVideosSchema,
  typeYoutubeVideosSchema,
} from "../schemas/youtubeSchema";

export const getTaiwanFoodVideosByQuery = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = searchYoutubeVideosSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(res, "Invalid query parameters", 400, parsed.error.flatten().fieldErrors);
    }

    const videos = await youtubeService.searchByQuery(
      parsed.data.query,
      parsed.data.maxResults,
    );
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
    const parsed = typeYoutubeVideosSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(res, "Invalid query parameters", 400, parsed.error.flatten().fieldErrors);
    }

    const videos = await youtubeService.getFromChannel(
      parsed.data.type || "video",
      parsed.data.maxResults || 10,
    );
    sendSuccess(res, videos);
  } catch (error) {
    next(error);
  }
};

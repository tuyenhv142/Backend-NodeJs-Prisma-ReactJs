import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../helpers/apiResponse";
import { restaurantService } from "../services/restaurantService";
import { AppError } from "../helpers/AppError";
import {
  CreateRestaurantSchema,
  RestaurantIdSchema,
  NearbyRestaurantQuerySchema,
} from "../schemas/restaurantSchema";
import { GetListSchema } from "../schemas/authSchema";

export const getRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = GetListSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(res, "Invalid query parameters", 400, parsed.error.flatten().fieldErrors);
    }

    const result = await restaurantService.list(parsed.data);
    sendSuccess(res, result.data, 200, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (error) {
    next(error);
  }
};

export const createRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = CreateRestaurantSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, "Data is invalid", 400, parsed.error.flatten().fieldErrors);
    }

    const restaurant = await restaurantService.create(parsed.data);
    sendSuccess(res, restaurant, 201);
  } catch (error) {
    next(error);
  }
};

export const deleteRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = RestaurantIdSchema.safeParse(req.params);
    if (!parsed.success) {
      return sendError(res, "Invalid Restaurant ID", 400);
    }

    await restaurantService.delete(parseInt(parsed.data.id, 10));
    sendSuccess(res, { message: "Deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const syncGoogleRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 22.853744338473003;
    const lng = parseFloat(req.query.lng as string) || 120.26357721081662;
    const radius = parseInt(req.query.radius as string) || 2000;

    const result = await restaurantService.syncGooglePlaces({ lat, lng, radius });
    sendSuccess(res, {
      message: "Sync Google Restaurants successful!",
      count: result.count,
    });
  } catch (error) {
    next(error);
  }
};

export const getNearby = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = NearbyRestaurantQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(res, "Invalid query parameters", 400, parsed.error.flatten().fieldErrors);
    }

    const restaurants = await restaurantService.getNearby(parsed.data);
    sendSuccess(res, restaurants);
  } catch (error) {
    next(error);
  }
};

export const addReview = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const param = RestaurantIdSchema.safeParse(req.params);
    if (!param.success) {
      return sendError(res, "Invalid restaurant ID", 400);
    }

    const userId = req.user?.userId;
    if (!userId) {
      throw AppError.unauthorized("Token is missing or invalid");
    }

    const { rating, comment } = req.body;
    const result = await restaurantService.addReview({
      restaurantId: Number(param.data.id),
      userId: Number(userId),
      rating,
      comment,
    });

    sendSuccess(res, result, 201);
  } catch (error) {
    next(error);
  }
};

import { Request, Response, NextFunction } from "express";
import { sendSuccess, sendError } from "../helpers/apiResponse";
import { prisma } from "../prisma/client";
import {
  CreateRestaurantSchema,
  RestaurantIdSchema,
  NearbyRestaurantQuerySchema,
} from "../schemas/restaurantSchema";
import { GetListSchema } from "../schemas/authSchema";
import { z } from "zod"; // ← thêm import zod để parse query params
import axios from "axios";

export const getRestaurants = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const parsed = GetListSchema.safeParse(req.query);
    if (!parsed.success) {
      return sendError(
        res,
        "Invalid query parameters",
        400,
        parsed.error.flatten().fieldErrors,
      );
    }

    const { page = 1, limit = 10 } = parsed.data;
    const offset = (page - 1) * limit;

    const restaurants = await prisma.restaurant.findMany({
      skip: offset,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        // Cho include vào chung nhà với skip, take, orderBy
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });
    sendSuccess(res, restaurants);
  } catch (error) {
    next(error); // ← dùng next() để errorHandler xử lý
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
      return sendError(
        res,
        "Data is invalid",
        400,
        parsed.error.flatten().fieldErrors,
      );
    }

    // const existingRestaurant = await prisma.restaurant.findFirst({
    //   where: {
    //     name: parsed.data.name,
    //     address: parsed.data.address,
    //   },
    // });

    // if (existingRestaurant) {
    //   return sendError(res, "This restaurant already exists", 409); // ← 409 Conflict đúng hơn 400
    // }

    const newRestaurant = await prisma.restaurant.create({
      data: {
        name: parsed.data.name,
        placeId: parsed.data.placeId || "",
        address: parsed.data.address,
        city: parsed.data.city,
        rating: parsed.data.rating || 0,
        category: parsed.data.category || "Other",
        imageUrl: parsed.data.imageUrl,
        lat: parsed.data.lat || 0,
        lng: parsed.data.lng || 0,
      },
    });
    sendSuccess(res, newRestaurant, 201);
  } catch (error) {
    next(error); // ← dùng next() để errorHandler xử lý
  }
};

export const deleteRestaurant = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    // 1. Parse từ req.params thay vì req.query
    const parsed = RestaurantIdSchema.safeParse(req.params);

    if (!parsed.success) {
      return sendError(res, "Invalid Restaurant ID", 400);
    }

    const restaurantId = parseInt(parsed.data.id, 10);

    if (isNaN(restaurantId)) {
      return sendError(res, "ID must be a number", 400);
    }

    // 2. Kiểm tra tồn tại
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!existingRestaurant) {
      return sendError(res, "Restaurant not found", 404);
    }

    // 3. Xóa
    await prisma.restaurant.delete({
      where: { id: restaurantId },
    });

    sendSuccess(res, { message: "Deleted successfully" }, 200);
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
    // ✅ Dùng đúng key cho Places API
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ message: "Missing GOOGLE_PLACES_API_KEY" });
    }

    // ✅ Cho phép truyền lat/lng động từ query, fallback về Tainan
    const lat = parseFloat(req.query.lat as string) || 22.853744338473003;
    const lng = parseFloat(req.query.lng as string) || 120.26357721081662;
    const radius = parseInt(req.query.radius as string) || 2000;

    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${lat},${lng}` +
      `&radius=${radius}` +
      `&type=restaurant` +
      `&key=${apiKey}` +
      `&language=zh-TW`;

    const response = await axios.get(url);

    // ✅ Log status từ Google để debug dễ hơn
    if (response.data.status !== "OK") {
      console.error(
        "Google Places API error:",
        response.data.status,
        response.data.error_message,
      );
      return res.status(502).json({
        message: "Google Places API error",
        status: response.data.status,
        detail: response.data.error_message,
      });
    }

    const googleResults = response.data.results;

    if (!googleResults || googleResults.length === 0) {
      return sendSuccess(res, { message: "No restaurants found", count: 0 });
    }

    const syncPromises = googleResults.map((place: any) =>
      prisma.restaurant.upsert({
        where: { placeId: place.place_id },
        update: { rating: place.rating || 0 },
        create: {
          name: place.name,
          placeId: place.place_id,
          address: place.vicinity,
          city: "Tainan", // ✅ Sửa lại cho đúng
          rating: place.rating || 0,
          category: "Taiwanese Food",
          imageUrl: place.photos
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${place.photos[0].photo_reference}&key=${apiKey}`
            : null,
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng,
        },
      }),
    );

    await Promise.all(syncPromises);

    sendSuccess(res, {
      message: "Sync Google Restaurants successful!",
      count: googleResults.length,
    });
  } catch (error) {
    console.error("Google Sync Error:", error);
    next(error);
  }
};

export const getNearby = async (req: Request, res: Response) => {
  // const { lat, lng, radius = 2 } = req.query;
  const parsed = NearbyRestaurantQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return sendError(
      res,
      "Invalid query parameters",
      400,
      parsed.error.flatten().fieldErrors,
    );
  }

  const restaurants = await prisma.$queryRaw`
  SELECT *,(
    6371 * acos(
      cos(radians(${parsed.data.lat})) * cos(radians(lat)) *cos(radians(lng) - radians(${parsed.data.lng})) 
      + sin(radians(${parsed.data.lat})) * sin(radians(lat))
    )
  ) AS distance 
  FROM restaurants 
  HAVING distance < ${parsed.data.radius} 
  ORDER BY distance ASC;
  `;

  res.json({ success: true, data: restaurants });
};

// Thêm vào restaurantController.ts
export const addReview = async (req: Request, res: Response) => {
  try {
    const param = RestaurantIdSchema.safeParse(req.params);
    const { rating, comment } = req.body;

    if (!param.success) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid restaurant ID" });
    }

    // 1. Lấy đúng tên biến từ Token
    const userId = req.user?.userId;
    const userName = req.user?.userName;

    // 2. Chặn lỗi nếu không có userId
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Token không hợp lệ, vui lòng đăng nhập lại!",
      });
    }

    const { id: restaurantId } = param.data;

    // 3. Tạo Review và Include dữ liệu
    const newReview = await prisma.review.create({
      data: {
        restaurantId: Number(restaurantId),
        userId: Number(userId),
        rating,
        comment,
      },
      include: {
        user: { select: { id: true, name: true } },
        restaurant: { select: { id: true, name: true } },
      },
    });

    // 4. Format lại response cho đẹp
    const response = {
      reviewId: newReview.id,
      rating: newReview.rating,
      comment: newReview.comment,
      createdAt: newReview.createdAt,
      restaurant: {
        id: newReview.restaurant.id,
        name: newReview.restaurant.name,
      },
      user: {
        id: newReview.user.id,
        name: newReview.user.name,
      },
    };

    const averageRating = await prisma.review.aggregate({
      where: { restaurantId: Number(restaurantId) },
      _avg: { rating: true },
    });

    await prisma.restaurant.update({
      where: { id: Number(restaurantId) },
      data: { rating: averageRating._avg.rating || 0 },
    });
    res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error("Lỗi khi thêm review:", error);
    res.status(500).json({ success: false, message: "Lỗi Server" });
  }
};

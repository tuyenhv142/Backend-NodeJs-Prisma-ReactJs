import axios from "axios";
import { prisma } from "../prisma/client";
import { AppError } from "../helpers/AppError";
import { logger } from "../helpers/logger";

// ── Types ─────────────────────────────────────────
export interface CreateRestaurantInput {
  name: string;
  placeId?: string | null;
  address: string;
  city?: string | null;
  rating?: number | null;
  category?: string | null;
  imageUrl?: string | null;
  lat?: number | null;
  lng?: number | null;
}

export interface ListParams {
  page: number;
  limit: number;
}

export interface NearbyParams {
  lat: number;
  lng: number;
  radius: number;
}

export interface ReviewInput {
  restaurantId: number;
  userId: number;
  rating: number;
  comment?: string;
}

// ── Service ───────────────────────────────────────
export const restaurantService = {
  async list(params: ListParams) {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          reviews: {
            orderBy: { createdAt: "desc" },
            include: {
              user: { select: { id: true, name: true } },
            },
          },
        },
      }),
      prisma.restaurant.count(),
    ]);

    return { data: restaurants, total, page, limit };
  },

  async create(input: CreateRestaurantInput) {
    const restaurant = await prisma.restaurant.create({
      data: {
        name: input.name,
        placeId: input.placeId || "",
        address: input.address,
        city: input.city,
        rating: input.rating || 0,
        category: input.category || "Other",
        imageUrl: input.imageUrl,
        lat: input.lat || 0,
        lng: input.lng || 0,
      },
    });
    return restaurant;
  },

  async delete(id: number) {
    const existing = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!existing) {
      throw AppError.notFound("Restaurant not found");
    }

    await prisma.restaurant.delete({ where: { id } });
  },

  async syncGooglePlaces(params: { lat: number; lng: number; radius: number }) {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      throw AppError.internal("Missing GOOGLE_PLACES_API_KEY");
    }

    const url =
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json` +
      `?location=${params.lat},${params.lng}` +
      `&radius=${params.radius}` +
      `&type=restaurant` +
      `&key=${apiKey}` +
      `&language=zh-TW`;

    const response = await axios.get(url);

    if (response.data.status !== "OK") {
      logger.error("Google Places API error", {
        status: response.data.status,
        detail: response.data.error_message,
      });
      throw AppError.internal("Google Places API error");
    }

    const googleResults = response.data.results;
    if (!googleResults || googleResults.length === 0) {
      return { count: 0 };
    }

    const syncPromises = googleResults.map((place: any) =>
      prisma.restaurant.upsert({
        where: { placeId: place.place_id },
        update: { rating: place.rating || 0 },
        create: {
          name: place.name,
          placeId: place.place_id,
          address: place.vicinity,
          city: "Tainan",
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
    return { count: googleResults.length };
  },

  async getNearby(params: NearbyParams) {
    const restaurants = await prisma.$queryRaw`
      SELECT *, (
        6371 * acos(
          cos(radians(${params.lat})) * cos(radians(lat)) *
          cos(radians(lng) - radians(${params.lng}))
          + sin(radians(${params.lat})) * sin(radians(lat))
        )
      ) AS distance
      FROM restaurants
      HAVING distance < ${params.radius}
      ORDER BY distance ASC
    `;
    return restaurants;
  },

  async addReview(input: ReviewInput) {
    const newReview = await prisma.review.create({
      data: {
        restaurantId: input.restaurantId,
        userId: input.userId,
        rating: input.rating,
        comment: input.comment || "",
      },
      include: {
        user: { select: { id: true, name: true } },
        restaurant: { select: { id: true, name: true } },
      },
    });

    // Cập nhật rating trung bình
    const avg = await prisma.review.aggregate({
      where: { restaurantId: input.restaurantId },
      _avg: { rating: true },
    });

    await prisma.restaurant.update({
      where: { id: input.restaurantId },
      data: { rating: avg._avg.rating || 0 },
    });

    return {
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
  },
};

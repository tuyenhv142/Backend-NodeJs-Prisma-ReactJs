import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const CreateRestaurantSchema = z.object({
  name: z.string().min(1),
  placeId: z.string().min(1).nullable().default(null), // ← thêm placeId nếu Hoang đã định nghĩa trong Prisma Schema
  address: z.string().min(1),
  city: z.string().min(1),
  rating: z.number().min(0).max(5).nullable().default(0),
  category: z.string().nullable().default("General"),
  imageUrl: z.string().url().nullable().default(null),
  lat: z.number().nullable().default(null),
  lng: z.number().nullable().default(null),
});

// ← thêm RestaurantSchema (response từ DB có thêm id, createdAt)
export const RestaurantSchema = CreateRestaurantSchema.extend({
  id: z.number(),
  createdAt: z.string().datetime(),
});

// Thêm vào file schema của bạn
export const RestaurantIdSchema = z
  .object({
    id: z.string().openapi({
      param: { name: "id", in: "path" }, // Khai báo đây là path param
      example: "1",
      description: "restaurant id",
    }),
  })
  .openapi("RestaurantIdParam");

export const NearbyRestaurantQuerySchema = z
  .object({
    // Sử dụng z.coerce.number() để tự động chuyển "10" thành 10
    lat: z.coerce
      .number()
      .min(-180)
      .max(180)
      .default(23.069868388011578) // Bạn có thể set mặc định ở đây luôn
      .openapi({ description: "Vĩ độ", example: 23.069868388011578 }),

    lng: z.coerce
      .number()
      .min(-180)
      .max(180)
      .default(120.1748359908211) // Bạn có thể set mặc định ở đây luôn
      .openapi({ description: "Kinh độ", example: 120.1748359908211 }),

    radius: z.coerce
      .number()
      .int() // Đảm bảo là số nguyên
      .positive() // Đảm bảo là số dương
      .optional()
      .default(2) // Bạn có thể set mặc định ở đây luôn
      .openapi({
        description: "Bán kính tìm kiếm (km)",
        example: 2,
      }),
  })
  .openapi("NearbyRestaurantQuery");

export type CreateRestaurantInput = z.infer<typeof CreateRestaurantSchema>;
export type Restaurant = z.infer<typeof RestaurantSchema>;
export type RestaurantId = z.infer<typeof RestaurantIdSchema>;
export type NearbyRestaurantQuery = z.infer<typeof NearbyRestaurantQuerySchema>;

import { Router } from "express";
import { z } from "zod"; // ← thiếu
import {
  registry,
  commonResponses,
  okResponse,
  createdResponse,
} from "../swagger";
import {
  CreateRestaurantSchema,
  NearbyRestaurantQuerySchema,
  RestaurantIdSchema,
  RestaurantSchema,
} from "../schemas/restaurantSchema";
import {
  getRestaurants,
  createRestaurant,
  deleteRestaurant,
  syncGoogleRestaurants,
  getNearby,
  addReview,
} from "../controllers/restaurantController";
import {
  authenticatePreAuthToken,
  authenticateUserToken,
} from "../middlewares/authMiddleware";
import { GetListSchema } from "../schemas/authSchema";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/restaurants",
  tags: ["Restaurants"],
  summary: "Get restaurants list",
  request: {
    query: GetListSchema, // Zod sẽ check các params trên URL
  },
  security: [{ preAuthToken: [] }],
  responses: { ...okResponse(z.array(RestaurantSchema)), ...commonResponses },
});

registry.registerPath({
  method: "post",
  path: "/api/restaurants",
  tags: ["Restaurants"],
  summary: "Create new restaurant",
  security: [{ preAuthToken: [] }],
  request: {
    body: {
      content: { "application/json": { schema: CreateRestaurantSchema } },
    },
  },
  responses: { ...createdResponse(RestaurantSchema), ...commonResponses },
});

registry.registerPath({
  method: "delete",
  path: "/api/restaurants/{id}", // Sửa path có thêm {id}
  tags: ["Restaurants"],
  summary: "Delete restaurant by id",
  request: {
    params: RestaurantIdSchema, // Dùng params thay vì query
  },
  security: [{ preAuthToken: [] }],
  responses: {
    ...okResponse(z.object({ message: z.string() }).openapi("DeleteSuccess")),
    ...commonResponses,
  },
});

registry.registerPath({
  method: "post",
  path: "/api/restaurants/sync-google",
  tags: ["Restaurants"],
  summary: "Sync Google Restaurants",
  security: [{ preAuthToken: [] }],
  responses: {
    ...okResponse(z.object({ message: z.string() }).openapi("SyncSuccess")),
    ...commonResponses,
  },
});

registry.registerPath({
  method: "get",
  path: "/api/restaurants/nearby",
  tags: ["Restaurants"],
  summary: "Get restaurants nearby",
  security: [{ preAuthToken: [] }],
  request: {
    query: NearbyRestaurantQuerySchema,
  },
  responses: { ...okResponse(z.array(RestaurantSchema)), ...commonResponses },
});

registry.registerPath({
  method: "post",
  path: "/api/restaurants/{id}/reviews",
  tags: ["Restaurants"],
  summary: "Add review to restaurant",
  security: [{ bearerAuth: [] }],
  request: {
    params: RestaurantIdSchema,
    body: {
      content: {
        "application/json": {
          schema: z.object({
            rating: z.number().min(0).max(5),
            comment: z.string().optional(),
          }),
        },
      },
    },
  },
  responses: {
    ...okResponse(z.object({ message: z.string() }).openapi("ReviewSuccess")),
    ...commonResponses,
  },
});

router.delete("/:id", authenticatePreAuthToken, deleteRestaurant);
router.get("/", authenticatePreAuthToken, getRestaurants);
router.post("/", authenticatePreAuthToken, createRestaurant);
router.post("/sync-google", authenticatePreAuthToken, syncGoogleRestaurants);
router.get("/nearby", authenticatePreAuthToken, getNearby);
router.post("/:id/reviews", authenticateUserToken, addReview);
export default router;

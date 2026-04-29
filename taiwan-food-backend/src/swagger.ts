import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

const registry = new OpenAPIRegistry();

registry.registerComponent("securitySchemes", "preAuthToken", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});
// Trong file chứa registry của bạn
registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

// ── Response wrapper chuẩn ──────────────────────────────
const successResponse = (dataSchema: z.ZodTypeAny) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

const errorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

// ── Responses tái sử dụng ───────────────────────────────
export const commonResponses = {
  400: {
    description: "Data invalid",
    content: { "application/json": { schema: errorResponse } },
  },
  404: {
    description: "Not found",
    content: { "application/json": { schema: errorResponse } },
  },
  500: {
    description: "Server error",
    content: { "application/json": { schema: errorResponse } },
  },
};

export const okResponse = (dataSchema: z.ZodTypeAny) => ({
  200: {
    description: "Success",
    content: { "application/json": { schema: successResponse(dataSchema) } },
  },
});

export const createdResponse = (dataSchema: z.ZodTypeAny) => ({
  201: {
    description: "Created",
    content: { "application/json": { schema: successResponse(dataSchema) } },
  },
});

export { registry };

export const buildSwaggerSpec = () => {
  const host = process.env.HOST === "0.0.0.0" ? "localhost" : (process.env.HOST || "localhost");
  const port = process.env.PORT || "8765";
  return new OpenApiGeneratorV3(registry.definitions).generateDocument({
    openapi: "3.0.0",
    info: { title: "Taiwan Food Finder API", version: "1.0.0" },
    servers: [{ url: `http://${host}:${port}` }],
  });
};

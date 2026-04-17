import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export const GetYoutubeVideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  thumbnail: z.string().url(),
  channel: z.string(),
});

export const searchYoutubeVideosSchema = z.object({
  query: z.string().min(1, "Query must be at least 1 character"),
  maxResults: z.coerce.number().default(10),
});

export const typeYoutubeVideosSchema = z.object({
  type: z
    .string()
    .min(1, "Type must be at least 1 character")
    .default("video")
    .nullable(),
  maxResults: z.coerce.number().default(10),
});

export type GetYoutubeVideoInput = z.infer<typeof GetYoutubeVideoSchema>;
export type SearchYoutubeVideosInput = z.infer<
  typeof searchYoutubeVideosSchema
>;
export type TypeYoutubeVideosInput = z.infer<typeof typeYoutubeVideosSchema>;
// export type IdChanelYoutubeVideoInput = z.infer<typeof idChanelYoutubeVideoSchema>;

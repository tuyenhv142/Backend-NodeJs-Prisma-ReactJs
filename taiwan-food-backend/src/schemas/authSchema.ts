import {z} from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

extendZodWithOpenApi(z);

export const GetPreAuthTokenSchema = z.object({
  ApiKey: z.string().min(1, "API Key is required"),
});

// export const PreAuthTokenRequestSchema = z.object({
//   preAuthToken: z.string(),
// });

export const LoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // preAuthToken: z.string(),
});

export const RegisterSchema = z.object({
  name: z.string().min(3, "Username must be at least 3 characters") ,
  password: z.string().min(6, "Password must be at least 6 characters"),
  imageUrl: z.string().url().nullable().default(null),
  // preAuthToken: z.string(),
});

export const UserSchema = RegisterSchema.extend({
  id: z.number(),
  createdAt: z.string().datetime(),
});

export const GetListSchema = z.object({
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

export type GetPreAuthTokenInput = z.infer<typeof GetPreAuthTokenSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UserInput = z.infer<typeof UserSchema>;
export type GetListInput = z.infer<typeof GetListSchema>;
// export type PreAuthTokenRequestInput = z.infer<typeof PreAuthTokenRequestSchema>;
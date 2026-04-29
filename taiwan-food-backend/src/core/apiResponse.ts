import { Response } from "express";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta?: { page?: number; limit?: number; total?: number },
) => {
  const body: ApiResponse<T> & { meta?: typeof meta } = { success: true, data };
  if (meta) (body as any).meta = meta;
  res.status(statusCode).json(body);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  details?: unknown,
) => {
  // Không log ở đây — để errorHandler tập trung xử lý
  const body: ApiResponse<never> = { success: false, error, details };
  res.status(statusCode).json(body);
};
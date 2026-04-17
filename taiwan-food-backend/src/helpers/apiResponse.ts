import { Response } from 'express';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  const body: ApiResponse<T> = { success: true, data };
  res.status(statusCode).json(body);
};

export const sendError = (res: Response, error: string, statusCode = 500, details?: unknown) => {
  const body: ApiResponse<never> = { success: false, error, details };
  res.status(statusCode).json(body);
};
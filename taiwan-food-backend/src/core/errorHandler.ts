import { Request, Response, NextFunction } from "express";
import { AppError } from "./appError";
import { logger } from "./logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const requestId = req.requestId;

  if (err instanceof AppError) {
    logger.warn(err.message, {
      requestId,
      statusCode: err.statusCode,
      code: err.code,
      details: err.details,
    });
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
      details: err.details,
      requestId,
    });
    return;
  }

  // Lỗi không xác định
  logger.error(err.message, {
    requestId,
    stack: err.stack,
  });
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    requestId,
  });
};

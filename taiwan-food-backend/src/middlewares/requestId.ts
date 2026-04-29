import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

/**
 * Gán requestId duy nhất cho mỗi request để trace log.
 */
export const requestId = (req: Request, _res: Response, next: NextFunction) => {
  req.requestId = (req.headers["x-request-id"] as string) || randomUUID();
  next();
};

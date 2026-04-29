// Quan trọng: Phải có ít nhất một dòng import/export để file này được hiểu là một module
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: {
        userId: number;
        userName?: string;
      };
    }
  }
}

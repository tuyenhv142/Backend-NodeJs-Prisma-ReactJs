// Quan trọng: Phải có ít nhất một dòng import/export để file này được hiểu là một module
import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        userName?: string; // Thêm các trường khác nếu token của bạn có
      };
    }
  }
}

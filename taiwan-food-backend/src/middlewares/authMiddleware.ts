import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { sendError } from "../core/apiResponse";

// 1. Tạo một Interface mô tả chính xác những gì bạn cất giấu trong Token lúc tạo (Sign)
// Định nghĩa lại cho chuẩn với hàm Login
interface UserJwtPayload {
  userId: number; // Đổi id thành userId
  userName: string; // Đổi name thành userName
}

interface PreAuthJwtPayload {
  device: string;
  // thêm các trường khác nếu có
}

export const authenticatePreAuthToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendError(res, "Require Pre-Auth Token to access", 401);
  }

  try {
    // Ép kiểu rõ ràng về PreAuthJwtPayload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as PreAuthJwtPayload;

    if (decoded.device !== "authorized_app") {
      return sendError(res, "Invalid Pre-Auth Token", 403);
    }

    (req as any).preAuth = decoded;
    next();
  } catch (error) {
    return sendError(res, "Pre-Auth Token has expired or is invalid", 403);
  }
};

export const authenticateUserToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return sendError(res, "Need Token to access", 401);
  }

  try {
    // 2. Ép kiểu kết quả giải mã về đúng giao diện UserJwtPayload
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as UserJwtPayload;

    // 3. Gán thẳng vào req.user. TypeScript sẽ không kêu ca gì nữa!
    req.user = {
      ...req.user,
      userId: decoded.userId,
      userName: decoded.userName,
    };

    next();
  } catch (error) {
    return sendError(res, "Token is invalid or has expired", 403);
  }
};

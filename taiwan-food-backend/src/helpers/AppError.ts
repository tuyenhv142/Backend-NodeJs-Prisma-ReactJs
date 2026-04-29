/**
 * Lớp lỗi chuẩn hóa cho toàn bộ ứng dụng.
 * Dùng trong Service Layer và được errorHandler xử lý tập trung.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }

  // ── Factory methods ──────────────────────────────
  static badRequest(message = "Invalid request", details?: unknown) {
    return new AppError(400, "BAD_REQUEST", message, details);
  }

  static unauthorized(message = "Authentication required") {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Access denied") {
    return new AppError(403, "FORBIDDEN", message);
  }

  static notFound(message = "Resource not found") {
    return new AppError(404, "NOT_FOUND", message);
  }

  static conflict(message = "Resource already exists") {
    return new AppError(409, "CONFLICT", message);
  }

  static internal(message = "Internal server error") {
    return new AppError(500, "INTERNAL", message);
  }
}

export class AppError extends Error {
  status: number;
  code: string;
  details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, code = "BAD_REQUEST", details?: unknown) {
    return new AppError(400, code, message, details);
  }
  static unauthorized(message = "Not authenticated", code = "UNAUTHORIZED") {
    return new AppError(401, code, message);
  }
  static forbidden(message = "Not authorized", code = "FORBIDDEN") {
    return new AppError(403, code, message);
  }
  static notFound(message = "Resource not found", code = "NOT_FOUND") {
    return new AppError(404, code, message);
  }
  static conflict(message: string, code = "CONFLICT") {
    return new AppError(409, code, message);
  }
}

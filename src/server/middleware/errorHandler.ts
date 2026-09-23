import type { Request, Response, NextFunction } from "express";
import { AppError } from "@server/utils/errors";
import { ZodError } from "zod";

// Fields that must never appear in logs even if present on the error object.
const SENSITIVE_KEYS = ["password", "passwordHash", "token", "refreshToken", "accessToken", "aadhaar"];

function redact(obj: unknown): unknown {
  if (!obj || typeof obj !== "object") return obj;
  const clone: Record<string, unknown> = { ...(obj as Record<string, unknown>) };
  for (const key of Object.keys(clone)) {
    if (SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s))) {
      clone[key] = "[redacted]";
    }
  }
  return clone;
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(404).json({ success: false, message: "Route not found", code: "ROUTE_NOT_FOUND" });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    });
  }

  // Unexpected error — log server-side (redacted) but never leak internals to the client.
  console.error("Unhandled error:", redact({ error: (err as Error)?.message, stack: (err as Error)?.stack }));
  res.status(500).json({
    success: false,
    message: "Internal server error",
    code: "INTERNAL_ERROR",
  });
}

import type { Response } from "express";
import type { ApiSuccess } from "@shared/types";

export function ok<T>(res: Response, data: T, pagination?: ApiSuccess<T>["pagination"], status = 200) {
  return res.status(status).json({ success: true, data, ...(pagination ? { pagination } : {}) });
}

export function created<T>(res: Response, data: T) {
  return ok(res, data, undefined, 201);
}

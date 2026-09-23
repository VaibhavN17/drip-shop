import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@server/utils/auth";
import { AppError } from "@server/utils/errors";
import { ROLE_PERMISSIONS, type Role } from "@shared/types";

export interface AuthedRequest extends Request {
  user?: { id: string; role: Role; username: string };
}

/** Requires a valid access token (Authorization: Bearer <token>). */
export function requireAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
  if (!token) return next(AppError.unauthorized());

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, role: payload.role, username: payload.username };
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired token", "TOKEN_INVALID"));
  }
}

/**
 * Requires the current user's role to have `permission` (e.g. "quotations:write").
 * OWNER always passes ("*"). A permission of the form "resource:*" on a role
 * covers every action on that resource.
 */
export function requirePermission(permission: string) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    const perms = ROLE_PERMISSIONS[req.user.role] || [];
    const [resource] = permission.split(":");
    const allowed =
      perms.includes("*") || perms.includes(permission) || perms.includes(`${resource}:*`);
    if (!allowed) return next(AppError.forbidden(`Missing permission: ${permission}`));
    next();
  };
}

export function requireRole(...roles: Role[]) {
  return (req: AuthedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) return next(AppError.unauthorized());
    if (!roles.includes(req.user.role)) return next(AppError.forbidden());
    next();
  };
}

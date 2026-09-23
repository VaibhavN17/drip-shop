import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { userCreateSchema } from "@server/validators/schemas";
import { hashPassword } from "@server/utils/auth";
import { AppError } from "@server/utils/errors";
import { ok, created } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

const SAFE_SELECT = {
  id: true, username: true, email: true, fullName: true, role: true,
  isActive: true, lastLoginAt: true, createdAt: true,
};

export async function list(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.user.findMany({ select: SAFE_SELECT, orderBy: { createdAt: "asc" } });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = userCreateSchema.parse(req.body);
    // Only OWNER may create another OWNER.
    if (data.role === "OWNER" && req.user?.role !== "OWNER") {
      throw AppError.forbidden("Only an owner can create another owner account");
    }
    const passwordHash = await hashPassword(data.password);
    const row = await prisma.user.create({
      data: { username: data.username, email: data.email, fullName: data.fullName, role: data.role, passwordHash },
      select: SAFE_SELECT,
    });
    await audit(req, "user_created", "user", row.id, { role: data.role });
    return created(res, row);
  } catch (err) {
    next(err);
  }
}

export async function deactivate(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const row = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false }, select: SAFE_SELECT });
    await audit(req, "user_deactivated", "user", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

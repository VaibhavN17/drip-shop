import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { productCategorySchema } from "@server/validators/schemas";
import { AppError } from "@server/utils/errors";
import { ok, created } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

export async function list(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.productCategory.findMany({ orderBy: { sortOrder: "asc" } });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = productCategorySchema.parse(req.body);
    const row = await prisma.productCategory.create({ data });
    await audit(req, "category_created", "product_category", row.id);
    return created(res, row);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = productCategorySchema.partial().parse(req.body);
    const row = await prisma.productCategory.update({ where: { id: req.params.id }, data });
    await audit(req, "category_updated", "product_category", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const inUse = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (inUse > 0) {
      throw AppError.conflict("Cannot delete a category that is referenced by products", "CATEGORY_IN_USE");
    }
    await prisma.productCategory.delete({ where: { id: req.params.id } });
    await audit(req, "category_deleted", "product_category", req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

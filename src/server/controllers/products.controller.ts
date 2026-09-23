import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { productSchema, paginationSchema } from "@server/validators/schemas";
import { generateProductCode } from "@server/services/numbering.service";
import { AppError } from "@server/utils/errors";
import { ok, created } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

export async function list(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const categoryId = typeof req.query.categoryId === "string" ? req.query.categoryId : undefined;
    const where = {
      ...(categoryId ? { categoryId } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { productCode: { contains: search, mode: "insensitive" as const } },
              { nameMarathi: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.product.findMany({ where, skip: (page - 1) * limit, take: limit, include: { category: true }, orderBy: { name: "asc" } }),
      prisma.product.count({ where }),
    ]);
    return ok(res, rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const row = await prisma.product.findUnique({ where: { id: req.params.id }, include: { category: true } });
    if (!row) throw AppError.notFound("Product not found");
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = productSchema.parse(req.body);
    const productCode = await generateProductCode();
    const row = await prisma.product.create({ data: { ...data, productCode } });
    await audit(req, "product_created", "product", row.id, { productCode });
    return created(res, row);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = productSchema.partial().parse(req.body);
    const row = await prisma.product.update({ where: { id: req.params.id }, data });
    await audit(req, "product_updated", "product", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.product.update({ where: { id: req.params.id }, data: { isActive: false } });
    await audit(req, "product_deactivated", "product", req.params.id);
    return ok(res, { deactivated: true });
  } catch (err) {
    next(err);
  }
}

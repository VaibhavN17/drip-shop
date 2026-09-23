import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { governmentSchemeSchema, governmentRateSchema } from "@server/validators/schemas";
import { AppError } from "@server/utils/errors";
import { ok, created } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

export async function listSchemes(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.governmentScheme.findMany({ include: { rates: true }, orderBy: { financialYear: "desc" } });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}

export async function createScheme(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = governmentSchemeSchema.parse(req.body);
    const row = await prisma.governmentScheme.create({ data });
    await audit(req, "government_scheme_created", "government_scheme", row.id);
    return created(res, row);
  } catch (err) {
    next(err);
  }
}

export async function updateScheme(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = governmentSchemeSchema.partial().parse(req.body);
    const row = await prisma.governmentScheme.update({ where: { id: req.params.id }, data });
    await audit(req, "government_scheme_updated", "government_scheme", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

export async function listRates(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const schemeId = typeof req.query.schemeId === "string" ? req.query.schemeId : undefined;
    const rows = await prisma.governmentRate.findMany({
      where: schemeId ? { schemeId } : {},
      include: { product: true, scheme: true },
      orderBy: { effectiveFrom: "desc" },
    });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}

export async function createRate(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = governmentRateSchema.parse(req.body);
    const row = await prisma.governmentRate.create({ data });
    await audit(req, "government_rate_created", "government_rate", row.id);
    return created(res, row);
  } catch (err) {
    next(err);
  }
}

export async function updateRate(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = governmentRateSchema.partial().parse(req.body);
    const row = await prisma.governmentRate.update({ where: { id: req.params.id }, data });
    await audit(req, "government_rate_updated", "government_rate", row.id);
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

export async function removeRate(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    await prisma.governmentRate.update({ where: { id: req.params.id }, data: { isActive: false } });
    await audit(req, "government_rate_deactivated", "government_rate", req.params.id);
    return ok(res, { deactivated: true });
  } catch (err) {
    next(err);
  }
}

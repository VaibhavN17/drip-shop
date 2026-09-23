import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { customerSchema, paginationSchema } from "@server/validators/schemas";
import { generateCustomerCode } from "@server/services/numbering.service";
import { AppError } from "@server/utils/errors";
import { ok, created } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";
import { toNumber } from "@server/utils/numberFormat";

export async function list(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const where = search
      ? {
          OR: [
            { fullName: { contains: search, mode: "insensitive" as const } },
            { mobile: { contains: search } },
            { village: { contains: search, mode: "insensitive" as const } },
            { customerCode: { contains: search, mode: "insensitive" as const } },
            { farmerId: { contains: search, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [rows, total] = await Promise.all([
      prisma.customer.findMany({ where, skip: (page - 1) * limit, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.customer.count({ where }),
    ]);

    return ok(
      res,
      rows.map((c) => ({ ...c, landArea: toNumber(c.landArea) })),
      { page, limit, total, totalPages: Math.ceil(total / limit) }
    );
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const customer = await prisma.customer.findUnique({
      where: { id: req.params.id },
      include: {
        quotations: { orderBy: { createdAt: "desc" }, take: 20 },
        invoices: { orderBy: { createdAt: "desc" }, take: 20, include: { payments: true } },
      },
    });
    if (!customer) throw AppError.notFound("Customer not found");

    const totalPurchases = customer.invoices.reduce((sum, i) => sum + Number(i.totalAmount), 0);
    const outstanding = customer.invoices.reduce((sum, i) => sum + Number(i.balanceAmount), 0);

    return ok(res, {
      ...customer,
      landArea: toNumber(customer.landArea),
      summary: { totalPurchases, outstanding },
    });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = customerSchema.parse(req.body);
    const customerCode = await generateCustomerCode();
    const customer = await prisma.customer.create({
      data: { ...data, customerCode, createdById: req.user?.id },
    });
    await audit(req, "customer_created", "customer", customer.id, { customerCode });
    return created(res, customer);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = customerSchema.partial().parse(req.body);
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound("Customer not found");

    const customer = await prisma.customer.update({ where: { id: req.params.id }, data });
    await audit(req, "customer_updated", "customer", customer.id);
    return ok(res, customer);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound("Customer not found");

    const linked = await prisma.quotation.count({ where: { customerId: req.params.id } });
    if (linked > 0) {
      throw AppError.conflict("Cannot delete a customer with existing quotations/invoices", "CUSTOMER_HAS_RECORDS");
    }
    await prisma.customer.delete({ where: { id: req.params.id } });
    await audit(req, "customer_deleted", "customer", req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

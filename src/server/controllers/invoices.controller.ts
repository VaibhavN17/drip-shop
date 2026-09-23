import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { invoiceUpdateSchema, paginationSchema } from "@server/validators/schemas";
import { calculateGst } from "@server/services/subsidy.service";
import { AppError } from "@server/utils/errors";
import { ok } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

export async function list(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const paymentStatus = typeof req.query.paymentStatus === "string" ? req.query.paymentStatus : undefined;
    const where = {
      ...(paymentStatus ? { paymentStatus: paymentStatus as any } : {}),
      ...(search
        ? {
            OR: [
              { invoiceNumber: { contains: search, mode: "insensitive" as const } },
              { customer: { fullName: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { customer: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.invoice.count({ where }),
    ]);
    return ok(res, rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const row = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: {
        customer: true,
        items: { include: { product: true }, orderBy: { sortOrder: "asc" } },
        payments: { orderBy: { paymentDate: "desc" } },
        quotation: true,
      },
    });
    if (!row) throw AppError.notFound("Invoice not found");
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

/** Apply discount / round-off / interstate flag and recompute totals server-side. */
export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = invoiceUpdateSchema.parse(req.body);
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice) throw AppError.notFound("Invoice not found");

    const isInterstate = data.isInterstate ?? invoice.isInterstate;
    const discount = data.discount ?? Number(invoice.discount);
    const taxableValue = Number(invoice.subtotal) - discount;
    const gst = calculateGst(taxableValue, Number(invoice.gstRate), isInterstate);
    const rawTotal = taxableValue + gst.gstAmount;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = Math.round((roundedTotal - rawTotal + Number.EPSILON) * 100) / 100;
    const balanceAmount = Math.max(0, roundedTotal - Number(invoice.paidAmount));

    const updated = await prisma.invoice.update({
      where: { id: req.params.id },
      data: {
        discount,
        isInterstate,
        cgst: gst.cgst,
        sgst: gst.sgst,
        igst: gst.igst,
        gstAmount: gst.gstAmount,
        roundOff,
        totalAmount: roundedTotal,
        balanceAmount,
        notes: data.notes,
      },
    });
    await audit(req, "invoice_updated", "invoice", updated.id);
    return ok(res, updated);
  } catch (err) {
    next(err);
  }
}

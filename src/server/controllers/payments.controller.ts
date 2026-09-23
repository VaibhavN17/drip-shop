import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { paymentSchema } from "@server/validators/schemas";
import { AppError } from "@server/utils/errors";
import { ok, created } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

export async function listForInvoice(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.payment.findMany({
      where: { invoiceId: req.params.invoiceId },
      orderBy: { paymentDate: "desc" },
    });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}

/**
 * Record a payment against an invoice. paidAmount is always derived from
 * the sum of payment rows (not incremented ad hoc), and is hard-capped at
 * the invoice total — an over-payment is rejected outright.
 */
export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = paymentSchema.parse(req.body);
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.invoiceId } });
    if (!invoice) throw AppError.notFound("Invoice not found");

    const alreadyPaid = Number(invoice.paidAmount);
    const total = Number(invoice.totalAmount);
    if (alreadyPaid + data.amount > total + 0.01) {
      throw AppError.badRequest(
        `Payment of ${data.amount} exceeds the outstanding balance of ${(total - alreadyPaid).toFixed(2)}`,
        "PAYMENT_EXCEEDS_BALANCE"
      );
    }

    const payment = await prisma.$transaction(async (tx) => {
      const p = await tx.payment.create({
        data: {
          invoiceId: invoice.id,
          amount: data.amount,
          paymentDate: data.paymentDate ?? new Date(),
          paymentMethod: data.paymentMethod,
          referenceNumber: data.referenceNumber,
          notes: data.notes,
          createdById: req.user?.id,
        },
      });

      const newPaidAmount = Math.round((alreadyPaid + data.amount + Number.EPSILON) * 100) / 100;
      const newBalance = Math.max(0, Math.round((total - newPaidAmount + Number.EPSILON) * 100) / 100);
      const paymentStatus = newBalance <= 0.01 ? "PAID" : newPaidAmount > 0 ? "PARTIAL" : "UNPAID";

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { paidAmount: newPaidAmount, balanceAmount: newBalance, paymentStatus },
      });

      return p;
    });

    await audit(req, "payment_created", "payment", payment.id, { invoiceId: invoice.id, amount: data.amount });
    return created(res, payment);
  } catch (err) {
    next(err);
  }
}

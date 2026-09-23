import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { ok } from "@server/utils/response";
import type { AuthedRequest } from "@server/middleware/auth";

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function startOfMonth(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

/** Kept deliberately cheap: a handful of aggregate queries, no N+1s. */
export async function dashboard(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const today = startOfDay();
    const monthStart = startOfMonth();

    const [
      totalCustomers,
      totalQuotations,
      totalInvoices,
      totalProducts,
      todaySalesAgg,
      monthSalesAgg,
      pendingAgg,
      recentQuotations,
      recentInvoices,
    ] = await Promise.all([
      prisma.customer.count(),
      prisma.quotation.count(),
      prisma.invoice.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { invoiceDate: { gte: today } } }),
      prisma.invoice.aggregate({ _sum: { totalAmount: true }, where: { invoiceDate: { gte: monthStart } } }),
      prisma.invoice.aggregate({ _sum: { balanceAmount: true }, where: { paymentStatus: { not: "PAID" } } }),
      prisma.quotation.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { customer: true } }),
      prisma.invoice.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { customer: true } }),
    ]);

    return ok(res, {
      totalCustomers,
      totalQuotations,
      totalInvoices,
      totalProducts,
      todaySales: Number(todaySalesAgg._sum.totalAmount ?? 0),
      monthSales: Number(monthSalesAgg._sum.totalAmount ?? 0),
      pendingPayments: Number(pendingAgg._sum.balanceAmount ?? 0),
      recentQuotations,
      recentInvoices,
    });
  } catch (err) {
    next(err);
  }
}

export async function sales(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const from = req.query.from ? new Date(String(req.query.from)) : startOfMonth();
    const to = req.query.to ? new Date(String(req.query.to)) : new Date();

    const invoices = await prisma.invoice.findMany({
      where: { invoiceDate: { gte: from, lte: to } },
      select: { invoiceDate: true, totalAmount: true },
      orderBy: { invoiceDate: "asc" },
    });

    const byDay = new Map<string, number>();
    for (const inv of invoices) {
      const key = inv.invoiceDate.toISOString().slice(0, 10);
      byDay.set(key, (byDay.get(key) ?? 0) + Number(inv.totalAmount));
    }

    return ok(res, {
      from,
      to,
      total: invoices.reduce((s, i) => s + Number(i.totalAmount), 0),
      byDay: Array.from(byDay.entries()).map(([date, amount]) => ({ date, amount })),
    });
  } catch (err) {
    next(err);
  }
}

export async function customerPurchases(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.invoice.groupBy({
      by: ["customerId"],
      _sum: { totalAmount: true, balanceAmount: true },
      _count: { id: true },
      orderBy: { _sum: { totalAmount: "desc" } },
      take: 50,
    });
    const customers = await prisma.customer.findMany({
      where: { id: { in: rows.map((r) => r.customerId) } },
    });
    const byId = new Map(customers.map((c) => [c.id, c]));

    return ok(
      res,
      rows.map((r) => ({
        customer: byId.get(r.customerId),
        invoiceCount: r._count.id,
        totalPurchases: Number(r._sum.totalAmount ?? 0),
        outstanding: Number(r._sum.balanceAmount ?? 0),
      }))
    );
  } catch (err) {
    next(err);
  }
}

export async function outstanding(_req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const rows = await prisma.invoice.findMany({
      where: { paymentStatus: { not: "PAID" } },
      include: { customer: true },
      orderBy: { invoiceDate: "asc" },
    });
    return ok(res, rows);
  } catch (err) {
    next(err);
  }
}

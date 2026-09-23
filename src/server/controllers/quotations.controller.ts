import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { quotationSchema, quotationStatusSchema, paginationSchema } from "@server/validators/schemas";
import { generateQuotationNumber, generateInvoiceNumber } from "@server/services/numbering.service";
import { calculateItemTotals, calculateSubsidy, calculateGst } from "@server/services/subsidy.service";
import { AppError } from "@server/utils/errors";
import { ok, created } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

async function getShopDefaults() {
  const settings = await prisma.shopSettings.findFirst();
  return {
    quotationPrefix: settings?.quotationPrefix ?? "QTN",
    invoicePrefix: settings?.invoicePrefix ?? "INV",
  };
}

/**
 * Recompute every financial figure for a quotation from raw item data.
 * This is the ONLY place quotation totals are calculated — the frontend's
 * live preview is just a UX convenience and is never trusted on save.
 */
async function recalculate(input: {
  items: Array<{ quantity: number; sellingRate: number; governmentRate?: number | null }>;
  isSubsidyBased: boolean;
  subsidyPercentage?: number | null;
  fileExpense: number;
  otherCharges: number;
  gstRate: number;
  schemeId?: string | null;
}) {
  const { itemAmounts, subtotal } = calculateItemTotals(input.items);

  let maximumEligibleQuantity: number | null = null;
  let subsidyPercentage = input.subsidyPercentage ?? 0;
  if (input.isSubsidyBased && input.schemeId) {
    const rates = await prisma.governmentRate.findMany({ where: { schemeId: input.schemeId, isActive: true } });
    if (rates.length) {
      maximumEligibleQuantity = rates.reduce(
        (sum, r) => sum + (r.maximumEligibleQuantity ? Number(r.maximumEligibleQuantity) : 0),
        0
      ) || null;
      // If caller didn't specify a percentage, fall back to the scheme's.
      if (input.subsidyPercentage == null) subsidyPercentage = Number(rates[0].subsidyPercentage);
    }
  }

  const subsidy = calculateSubsidy({
    items: input.items,
    subsidyPercentage,
    maximumEligibleQuantity,
    isSubsidyBased: input.isSubsidyBased,
  });

  const taxableBase = subtotal + input.fileExpense + input.otherCharges;
  const { gstAmount } = calculateGst(taxableBase, input.gstRate, false);
  const totalAmount = Math.round((taxableBase + gstAmount + Number.EPSILON) * 100) / 100;

  return { itemAmounts, subtotal, subsidy, gstAmount, totalAmount, subsidyPercentageUsed: subsidyPercentage };
}

export async function list(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { page, limit, search } = paginationSchema.parse(req.query);
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const where = {
      ...(status ? { status: status as any } : {}),
      ...(search
        ? {
            OR: [
              { quotationNumber: { contains: search, mode: "insensitive" as const } },
              { customer: { fullName: { contains: search, mode: "insensitive" as const } } },
            ],
          }
        : {}),
    };
    const [rows, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { customer: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.quotation.count({ where }),
    ]);
    return ok(res, rows, { page, limit, total, totalPages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const row = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { customer: true, scheme: true, items: { include: { product: true }, orderBy: { sortOrder: "asc" } } },
    });
    if (!row) throw AppError.notFound("Quotation not found");
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = quotationSchema.parse(req.body);
    const { quotationPrefix } = await getShopDefaults();
    const quotationNumber = await generateQuotationNumber(quotationPrefix);

    const calc = await recalculate({
      items: data.items,
      isSubsidyBased: data.isSubsidyBased,
      subsidyPercentage: data.subsidyPercentage,
      fileExpense: data.fileExpense,
      otherCharges: data.otherCharges,
      gstRate: data.gstRate,
      schemeId: data.schemeId,
    });

    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: data.customerId,
        quotationDate: data.quotationDate ?? new Date(),
        validUntil: data.validUntil,
        schemeId: data.schemeId,
        subsidyPercentage: calc.subsidyPercentageUsed,
        isSubsidyBased: data.isSubsidyBased,
        landArea: data.landArea,
        status: "DRAFT",
        subtotal: calc.subtotal,
        fileExpense: data.fileExpense,
        otherCharges: data.otherCharges,
        gstRate: data.gstRate,
        gstAmount: calc.gstAmount,
        totalAmount: calc.totalAmount,
        eligibleAmount: calc.subsidy.eligibleAmount,
        subsidyAmount: calc.subsidy.subsidyAmount,
        farmerContribution: calc.subsidy.farmerContribution,
        nonEligibleAmount: calc.subsidy.nonEligibleAmount,
        notes: data.notes,
        createdById: req.user?.id,
        items: {
          create: data.items.map((item, idx) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            governmentRate: item.governmentRate,
            sellingRate: item.sellingRate,
            gstRate: item.gstRate,
            amount: calc.itemAmounts[idx],
            sortOrder: idx,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    await audit(req, "quotation_created", "quotation", quotation.id, { quotationNumber });
    return created(res, quotation);
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.quotation.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound("Quotation not found");
    if (existing.status === "CONVERTED") {
      throw AppError.conflict("Cannot edit a quotation that has been converted to an invoice", "QUOTATION_CONVERTED");
    }

    const data = quotationSchema.parse(req.body);
    const calc = await recalculate({
      items: data.items,
      isSubsidyBased: data.isSubsidyBased,
      subsidyPercentage: data.subsidyPercentage,
      fileExpense: data.fileExpense,
      otherCharges: data.otherCharges,
      gstRate: data.gstRate,
      schemeId: data.schemeId,
    });

    const quotation = await prisma.$transaction(async (tx) => {
      await tx.quotationItem.deleteMany({ where: { quotationId: req.params.id } });
      return tx.quotation.update({
        where: { id: req.params.id },
        data: {
          customerId: data.customerId,
          quotationDate: data.quotationDate,
          validUntil: data.validUntil,
          schemeId: data.schemeId,
          subsidyPercentage: calc.subsidyPercentageUsed,
          isSubsidyBased: data.isSubsidyBased,
          landArea: data.landArea,
          subtotal: calc.subtotal,
          fileExpense: data.fileExpense,
          otherCharges: data.otherCharges,
          gstRate: data.gstRate,
          gstAmount: calc.gstAmount,
          totalAmount: calc.totalAmount,
          eligibleAmount: calc.subsidy.eligibleAmount,
          subsidyAmount: calc.subsidy.subsidyAmount,
          farmerContribution: calc.subsidy.farmerContribution,
          nonEligibleAmount: calc.subsidy.nonEligibleAmount,
          notes: data.notes,
          items: {
            create: data.items.map((item, idx) => ({
              productId: item.productId,
              description: item.description,
              quantity: item.quantity,
              unit: item.unit,
              governmentRate: item.governmentRate,
              sellingRate: item.sellingRate,
              gstRate: item.gstRate,
              amount: calc.itemAmounts[idx],
              sortOrder: idx,
            })),
          },
        },
        include: { items: true, customer: true },
      });
    });

    await audit(req, "quotation_edited", "quotation", quotation.id);
    return ok(res, quotation);
  } catch (err) {
    next(err);
  }
}

export async function updateStatus(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const { status } = quotationStatusSchema.parse(req.body);
    const row = await prisma.quotation.update({ where: { id: req.params.id }, data: { status } });
    await audit(req, "quotation_status_changed", "quotation", row.id, { status });
    return ok(res, row);
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const existing = await prisma.quotation.findUnique({ where: { id: req.params.id } });
    if (!existing) throw AppError.notFound("Quotation not found");
    if (existing.status === "CONVERTED") {
      throw AppError.conflict("Cannot delete a quotation already converted to an invoice", "QUOTATION_CONVERTED");
    }
    await prisma.quotation.delete({ where: { id: req.params.id } });
    await audit(req, "quotation_deleted", "quotation", req.params.id);
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

export async function duplicate(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const original = await prisma.quotation.findUnique({ where: { id: req.params.id }, include: { items: true } });
    if (!original) throw AppError.notFound("Quotation not found");

    const { quotationPrefix } = await getShopDefaults();
    const quotationNumber = await generateQuotationNumber(quotationPrefix);

    const copy = await prisma.quotation.create({
      data: {
        quotationNumber,
        customerId: original.customerId,
        schemeId: original.schemeId,
        subsidyPercentage: original.subsidyPercentage,
        isSubsidyBased: original.isSubsidyBased,
        landArea: original.landArea,
        status: "DRAFT",
        subtotal: original.subtotal,
        fileExpense: original.fileExpense,
        otherCharges: original.otherCharges,
        gstRate: original.gstRate,
        gstAmount: original.gstAmount,
        totalAmount: original.totalAmount,
        eligibleAmount: original.eligibleAmount,
        subsidyAmount: original.subsidyAmount,
        farmerContribution: original.farmerContribution,
        nonEligibleAmount: original.nonEligibleAmount,
        notes: original.notes,
        createdById: req.user?.id,
        items: {
          create: original.items.map((item, idx) => ({
            productId: item.productId,
            description: item.description,
            quantity: item.quantity,
            unit: item.unit,
            governmentRate: item.governmentRate,
            sellingRate: item.sellingRate,
            gstRate: item.gstRate,
            amount: item.amount,
            sortOrder: idx,
          })),
        },
      },
      include: { items: true, customer: true },
    });

    await audit(req, "quotation_duplicated", "quotation", copy.id, { fromQuotationId: original.id });
    return created(res, copy);
  } catch (err) {
    next(err);
  }
}

/** Convert an approved/sent quotation into a tax invoice. Backend recomputes GST split. */
export async function convertToInvoice(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { items: true, customer: true },
    });
    if (!quotation) throw AppError.notFound("Quotation not found");
    if (quotation.status === "CONVERTED") {
      throw AppError.conflict("Quotation already converted to an invoice", "ALREADY_CONVERTED");
    }

    const { invoicePrefix } = await getShopDefaults();
    const invoiceNumber = await generateInvoiceNumber(invoicePrefix);
    const isInterstate = req.body?.isInterstate === true;

    const taxableValue = Number(quotation.subtotal) + Number(quotation.fileExpense) + Number(quotation.otherCharges);
    const gst = calculateGst(taxableValue, Number(quotation.gstRate), isInterstate);
    const totalAmount = Math.round((taxableValue + gst.gstAmount + Number.EPSILON) * 100) / 100;

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId: quotation.customerId,
          quotationId: quotation.id,
          subtotal: quotation.subtotal,
          cgst: gst.cgst,
          sgst: gst.sgst,
          igst: gst.igst,
          gstRate: quotation.gstRate,
          gstAmount: gst.gstAmount,
          discount: 0,
          roundOff: 0,
          totalAmount,
          paidAmount: 0,
          balanceAmount: totalAmount,
          paymentStatus: "UNPAID",
          isInterstate,
          notes: quotation.notes,
          createdById: req.user?.id,
          items: {
            create: quotation.items.map((item, idx) => {
              const itemGst = calculateGst(Number(item.amount), Number(item.gstRate), isInterstate);
              return {
                productId: item.productId,
                description: item.description,
                quantity: item.quantity,
                unit: item.unit,
                rate: item.sellingRate,
                taxableValue: item.amount,
                gstRate: item.gstRate,
                cgstAmount: itemGst.cgst,
                sgstAmount: itemGst.sgst,
                igstAmount: itemGst.igst,
                totalAmount: Math.round((Number(item.amount) + itemGst.gstAmount + Number.EPSILON) * 100) / 100,
                sortOrder: idx,
              };
            }),
          },
        },
        include: { items: true, customer: true },
      });
      await tx.quotation.update({ where: { id: quotation.id }, data: { status: "CONVERTED" } });
      return inv;
    });

    await audit(req, "invoice_created", "invoice", invoice.id, { fromQuotationId: quotation.id, invoiceNumber });
    return created(res, invoice);
  } catch (err) {
    next(err);
  }
}

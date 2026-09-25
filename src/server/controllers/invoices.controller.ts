import type { Response, NextFunction } from "express";
import { prisma } from "@server/db/client";
import { invoiceCreateSchema, invoiceUpdateSchema, paginationSchema } from "@server/validators/schemas";
import { generateInvoiceNumber, generateCustomerCode } from "@server/services/numbering.service";
import { calculateGst } from "@server/services/subsidy.service";
import { AppError } from "@server/utils/errors";
import { ok, created } from "@server/utils/response";
import { audit } from "@server/middleware/audit";
import type { AuthedRequest } from "@server/middleware/auth";

async function getInvoicePrefix() {
  const settings = await prisma.shopSettings.findFirst();
  return settings?.invoicePrefix ?? "INV";
}

async function resolveCustomerId(input: { customerId?: string | null; customer?: any; userId?: string }): Promise<string> {
  if (input.customerId) return input.customerId;
  if (!input.customer) throw AppError.badRequest("Customer details required");

  const existing = await prisma.customer.findFirst({ where: { mobile: input.customer.mobile } });
  if (existing) return existing.id;

  const customerCode = await generateCustomerCode();
  const aadhar = input.customer.aadhar?.replace(/\s+/g, "");
  const createdCust = await prisma.customer.create({
    data: {
      customerCode,
      fullName: input.customer.fullName,
      mobile: input.customer.mobile,
      village: input.customer.village ?? null,
      taluka: input.customer.taluka ?? null,
      district: input.customer.district ?? null,
      surveyNumber: input.customer.surveyNumber ?? null,
      gatNumber: input.customer.gatNumber ?? null,
      landArea: input.customer.landArea ? Number(input.customer.landArea) : null,
      crop: input.customer.crop ?? null,
      aadhaarLast4: aadhar && aadhar.length >= 4 ? aadhar.slice(-4) : null,
      notes: input.customer.aadhar ? `Aadhaar: ${input.customer.aadhar}` : null,
      createdById: input.userId,
    },
  });
  return createdCust.id;
}

export async function create(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const data = invoiceCreateSchema.parse(req.body);
    const prefix = await getInvoicePrefix();
    const invoiceNumber = await generateInvoiceNumber(prefix);

    const customerId = await resolveCustomerId({
      customerId: data.customerId,
      customer: data.customer,
      userId: req.user?.id,
    });

    const isInterstate = Boolean(data.isInterstate);
    let subtotal = 0;
    const computedItems = data.items.map((it, idx) => {
      const taxable = it.taxableValue ?? Math.round(Number(it.quantity) * Number(it.rate) * 100) / 100;
      subtotal += taxable;
      const itGst = calculateGst(taxable, Number(it.gstRate ?? data.gstRate), isInterstate);
      const itTotal = Math.round((taxable + itGst.gstAmount + Number.EPSILON) * 100) / 100;
      return {
        productId: it.productId ?? null,
        description: it.description,
        hsnCode: it.hsnCode || it.cmlNo || null,
        quantity: it.quantity,
        unit: it.unit || "Nos",
        rate: it.rate,
        taxableValue: taxable,
        gstRate: it.gstRate ?? data.gstRate,
        cgstAmount: itGst.cgst,
        sgstAmount: itGst.sgst,
        igstAmount: itGst.igst,
        totalAmount: itTotal,
        sortOrder: idx,
      };
    });

    const discount = Number(data.discount ?? 0);
    const installation = Number(data.installation ?? 0);
    const taxableBase = Math.max(0, subtotal - discount + installation);
    const overallGst = calculateGst(taxableBase, Number(data.gstRate), isInterstate);
    const rawTotal = taxableBase + overallGst.gstAmount;
    const roundedTotal = Math.round(rawTotal);
    const roundOff = Math.round((roundedTotal - rawTotal + Number.EPSILON) * 100) / 100;

    // Metadata note
    const metaParts: string[] = [];
    if (data.setType) metaParts.push(`संच प्रकार: ${data.setType}`);
    if (data.spacing) metaParts.push(`लागवडीचे अंतर: ${data.spacing}`);
    if (data.shiwar) metaParts.push(`शिवार: ${data.shiwar}`);
    if (installation > 0) metaParts.push(`इन्स्टॉलेशन: ₹${installation}`);
    if (data.notes) metaParts.push(data.notes);
    const finalNotes = metaParts.join(" | ");

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId,
          quotationId: data.quotationId ?? null,
          invoiceDate: data.invoiceDate ?? new Date(),
          subtotal,
          cgst: overallGst.cgst,
          sgst: overallGst.sgst,
          igst: overallGst.igst,
          gstRate: data.gstRate,
          gstAmount: overallGst.gstAmount,
          discount,
          roundOff,
          totalAmount: roundedTotal,
          paidAmount: 0,
          balanceAmount: roundedTotal,
          paymentStatus: "UNPAID",
          isInterstate,
          notes: finalNotes || null,
          createdById: req.user?.id,
          items: {
            create: computedItems,
          },
        },
        include: { items: true, customer: true },
      });

      if (data.quotationId) {
        await tx.quotation.update({
          where: { id: data.quotationId },
          data: { status: "CONVERTED" },
        });
      }

      return inv;
    });

    await audit(req, "invoice_created", "invoice", invoice.id, { invoiceNumber });
    return created(res, invoice);
  } catch (err) {
    next(err);
  }
}

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

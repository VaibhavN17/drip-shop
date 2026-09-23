import type { Response, NextFunction } from "express";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { prisma } from "@server/db/client";
import { AppError } from "@server/utils/errors";
import type { AuthedRequest } from "@server/middleware/auth";
import { QuotationPdfDocument } from "@server/pdf/quotationPdf";
import { InvoicePdfDocument } from "@server/pdf/invoicePdf";

async function getShop() {
  const shop = await prisma.shopSettings.findFirst();
  return shop ?? { shopName: "Drip Irrigation Shop" };
}

export async function quotationPdf(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { customer: true, items: true },
    });
    if (!quotation) throw AppError.notFound("Quotation not found");
    const shop = await getShop();

    const buffer = await renderToBuffer(
      React.createElement(QuotationPdfDocument, {
        shop,
        quotation: {
          quotationNumber: quotation.quotationNumber,
          quotationDate: quotation.quotationDate.toISOString(),
          validUntil: quotation.validUntil?.toISOString() ?? null,
          subtotal: Number(quotation.subtotal),
          fileExpense: Number(quotation.fileExpense),
          otherCharges: Number(quotation.otherCharges),
          gstRate: Number(quotation.gstRate),
          gstAmount: Number(quotation.gstAmount),
          totalAmount: Number(quotation.totalAmount),
          isSubsidyBased: quotation.isSubsidyBased,
          subsidyPercentage: quotation.subsidyPercentage ? Number(quotation.subsidyPercentage) : null,
          eligibleAmount: quotation.eligibleAmount ? Number(quotation.eligibleAmount) : null,
          subsidyAmount: quotation.subsidyAmount ? Number(quotation.subsidyAmount) : null,
          farmerContribution: quotation.farmerContribution ? Number(quotation.farmerContribution) : null,
          landArea: quotation.landArea ? Number(quotation.landArea) : null,
        },
        customer: quotation.customer,
        items: quotation.items.map((i) => ({
          description: i.description,
          quantity: Number(i.quantity),
          unit: i.unit,
          sellingRate: Number(i.sellingRate),
          amount: Number(i.amount),
        })),
      })
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${quotation.quotationNumber}.pdf"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

export async function invoicePdf(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: req.params.id },
      include: { customer: true, items: true },
    });
    if (!invoice) throw AppError.notFound("Invoice not found");
    const shop = await getShop();

    const buffer = await renderToBuffer(
      React.createElement(InvoicePdfDocument, {
        shop,
        invoice: {
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: invoice.invoiceDate.toISOString(),
          subtotal: Number(invoice.subtotal),
          cgst: Number(invoice.cgst),
          sgst: Number(invoice.sgst),
          igst: Number(invoice.igst),
          gstAmount: Number(invoice.gstAmount),
          discount: Number(invoice.discount),
          roundOff: Number(invoice.roundOff),
          totalAmount: Number(invoice.totalAmount),
        },
        customer: invoice.customer,
        items: invoice.items.map((i) => ({
          description: i.description,
          hsnCode: i.hsnCode,
          quantity: Number(i.quantity),
          unit: i.unit,
          rate: Number(i.rate),
          taxableValue: Number(i.taxableValue),
          cgstAmount: Number(i.cgstAmount),
          sgstAmount: Number(i.sgstAmount),
          totalAmount: Number(i.totalAmount),
        })),
      })
    );

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

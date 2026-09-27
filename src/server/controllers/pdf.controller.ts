import type { Response, NextFunction } from "express";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { prisma } from "@server/db/client";
import { AppError } from "@server/utils/errors";
import type { AuthedRequest } from "@server/middleware/auth";
import { QuotationPdfDocument } from "@server/pdf/quotationPdf";
import { InvoicePdfDocument } from "@server/pdf/invoicePdf";
import { MiniSprinklerPdfDocument } from "@server/pdf/miniSprinklerPdf";

async function getShop() {
  const shop = await prisma.shopSettings.findFirst();
  return {
    shopName: shop?.shopName || "SHETKARI RAJA HARDWARE AND ELECTRICALS",
    shopOwner: "Vaibhav Santosh More",
    address: shop?.address || "Lakh Khandala, Vaijapur, Maharashtra",
    mobile: shop?.mobile || "8010741843",
    taluka: "Vaijapur",
    state: shop?.state || "Maharashtra",
    gstin: shop?.gstin || null,
    footerText: shop?.footerText || null,
    termsAndConditions: shop?.termsAndConditions || null,
    bankName: shop?.bankName || null,
    bankAccountNumber: shop?.bankAccountNumber || null,
    bankIfsc: shop?.bankIfsc || null,
    upiId: shop?.upiId || null,
  };
}

export async function quotationPdf(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id: req.params.id },
      include: { customer: true, items: true },
    });
    if (!quotation) throw AppError.notFound("Quotation not found");
    const shop = await getShop();

    const isMiniSprinkler =
      req.query.format === "mini-sprinkler" ||
      req.query.format === "clean" ||
      quotation.notes?.includes("मिनी स्प्रिंकलर") ||
      quotation.notes?.includes("Mini Sprinkler");

    let buffer: any;

    if (isMiniSprinkler) {
      const qDate = new Date(quotation.quotationDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      // Extract farmer share / notes if present
      const farmerShare = quotation.farmerContribution ? Number(quotation.farmerContribution) : null;
      const subtotal = Number(quotation.subtotal);
      const gstRate = Number(quotation.gstRate);
      const gstAmount = Number(quotation.gstAmount);
      const grandTotal = Number(quotation.totalAmount);
      const balance = farmerShare != null ? Math.max(0, grandTotal - farmerShare) : grandTotal;

      buffer = await renderToBuffer(
        React.createElement(MiniSprinklerPdfDocument as any, {
          documentType: "QUOTATION",
          docNumber: quotation.quotationNumber,
          docDate: qDate,
          shop: {
            shopName: "SHETKARI RAJA HARDWARE AND ELECTRICALS",
            shopOwner: "Vaibhav Santosh More",
            address: "Lakh Khandala, Vaijapur, Maharashtra",
            mobile: "8010741843",
            taluka: "Vaijapur",
            state: "Maharashtra",
          },
          customer: {
            fullName: quotation.customer.fullName,
            mobile: quotation.customer.mobile,
            village: quotation.customer.village || "Lakh Khandala",
            taluka: quotation.customer.taluka || "Vaijapur",
            state: quotation.customer.state || "Maharashtra",
          },
          items: quotation.items.map((i) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit: i.unit,
            rate: Number(i.sellingRate),
            amount: Number(i.amount),
          })),
          totals: {
            subtotal,
            gstRate,
            gstAmount,
            grandTotal,
            farmerShare,
            balance,
          },
          customNote: quotation.notes?.replace(/मिनी स्प्रिंकलर[^|]*\|?/g, "").trim() || null,
        } as any) as any
      );
    } else {
      buffer = await renderToBuffer(
        React.createElement(QuotationPdfDocument as any, {
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
            notes: quotation.notes,
          },
          customer: {
            ...quotation.customer,
            landArea: quotation.customer.landArea ? Number(quotation.customer.landArea) : null,
          },
          items: quotation.items.map((i) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit: i.unit,
            sellingRate: Number(i.sellingRate),
            amount: Number(i.amount),
          })),
        } as any) as any
      );
    }

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

    const isMiniSprinkler =
      req.query.format === "mini-sprinkler" ||
      req.query.format === "clean" ||
      invoice.notes?.includes("मिनी स्प्रिंकलर") ||
      invoice.notes?.includes("Mini Sprinkler");

    let buffer: any;

    if (isMiniSprinkler) {
      const iDate = new Date(invoice.invoiceDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      const subtotal = Number(invoice.subtotal);
      const gstRate = Number(invoice.gstRate || 5);
      const gstAmount = Number(invoice.gstAmount);
      const grandTotal = Number(invoice.totalAmount);
      const farmerShareMatch = invoice.notes?.match(/शेतकरी हिस्सा[:\s]*([0-9.]+)/i);
      const farmerShare = farmerShareMatch ? Number(farmerShareMatch[1]) : null;
      const balance = farmerShare != null ? Math.max(0, grandTotal - farmerShare) : 0;

      buffer = await renderToBuffer(
        React.createElement(MiniSprinklerPdfDocument as any, {
          documentType: "INVOICE",
          docNumber: invoice.invoiceNumber,
          docDate: iDate,
          shop: {
            shopName: "SHETKARI RAJA HARDWARE AND ELECTRICALS",
            shopOwner: "Vaibhav Santosh More",
            address: "Lakh Khandala, Vaijapur, Maharashtra",
            mobile: "8010741843",
            taluka: "Vaijapur",
            state: "Maharashtra",
          },
          customer: {
            fullName: invoice.customer.fullName,
            mobile: invoice.customer.mobile,
            village: invoice.customer.village || "Lakh Khandala",
            taluka: invoice.customer.taluka || "Vaijapur",
            state: invoice.customer.state || "Maharashtra",
          },
          items: invoice.items.map((i) => ({
            description: i.description,
            quantity: Number(i.quantity),
            unit: i.unit,
            rate: Number(i.rate),
            amount: Number(i.totalAmount || i.taxableValue),
          })),
          totals: {
            subtotal,
            gstRate,
            gstAmount,
            grandTotal,
            farmerShare,
            balance,
          },
          customNote: invoice.notes?.replace(/मिनी स्प्रिंकलर[^|]*\|?/g, "").trim() || null,
        } as any) as any
      );
    } else {
      buffer = await renderToBuffer(
        React.createElement(InvoicePdfDocument as any, {
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
            gstRate: Number(invoice.gstRate),
            notes: invoice.notes,
          },
          customer: {
            ...invoice.customer,
            landArea: invoice.customer.landArea ? Number(invoice.customer.landArea) : null,
          },
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
        } as any) as any
      );
    }

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${invoice.invoiceNumber}.pdf"`);
    res.send(buffer);
  } catch (err) {
    next(err);
  }
}

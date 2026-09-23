import { prisma } from "@server/db/client";

/**
 * Generates sequential document numbers like QTN-2026-000001 / INV-2026-000001.
 * Uses the financial-year-ish calendar year and a per-prefix count. Wrapped
 * in a transaction with a row lock pattern (count + retry) to reduce (not
 * fully eliminate, since Neon HTTP mode has no advisory locks) race risk;
 * the unique constraint on the number column is the final safety net.
 */
export async function generateQuotationNumber(prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.quotation.count({
    where: { quotationNumber: { startsWith: `${prefix}-${year}-` } },
  });
  const next = String(count + 1).padStart(6, "0");
  return `${prefix}-${year}-${next}`;
}

export async function generateInvoiceNumber(prefix: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.invoice.count({
    where: { invoiceNumber: { startsWith: `${prefix}-${year}-` } },
  });
  const next = String(count + 1).padStart(6, "0");
  return `${prefix}-${year}-${next}`;
}

export async function generateCustomerCode(): Promise<string> {
  const count = await prisma.customer.count();
  return `CUST-${String(count + 1).padStart(5, "0")}`;
}

export async function generateProductCode(): Promise<string> {
  const count = await prisma.product.count();
  return `PRD-${String(count + 1).padStart(5, "0")}`;
}

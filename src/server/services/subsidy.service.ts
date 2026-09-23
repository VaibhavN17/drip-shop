/**
 * Subsidy calculation service.
 *
 * IMPORTANT: This is the single source of truth for quotation financial
 * totals. The backend always recalculates from raw item data — it never
 * trusts totals posted by the browser. Kept dependency-free so it stays
 * easily unit-testable (see subsidy.service.test.ts).
 */

import type { SubsidyCalcInput, SubsidyCalcResult } from "@shared/types";

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export interface ItemTotals {
  subtotal: number;
  itemAmounts: number[];
}

/** Recompute each line's amount (qty * sellingRate) and the item subtotal. */
export function calculateItemTotals(
  items: Array<{ quantity: number; sellingRate: number }>
): ItemTotals {
  const itemAmounts = items.map((i) => round2(i.quantity * i.sellingRate));
  const subtotal = round2(itemAmounts.reduce((sum, a) => sum + a, 0));
  return { subtotal, itemAmounts };
}

/**
 * Calculate subsidy split for a quotation.
 *
 * Eligibility is capped by `maximumEligibleQuantity` from the government
 * scheme when provided — i.e. subsidy is never blindly `total * pct`.
 * The eligible amount is computed against each item's *government rate*
 * (falling back to selling rate when no government rate is set), capped
 * at maximumEligibleQuantity of total quantity across items.
 */
export function calculateSubsidy(input: SubsidyCalcInput): SubsidyCalcResult {
  const { items, subsidyPercentage, maximumEligibleQuantity, isSubsidyBased } = input;

  const subtotal = round2(items.reduce((sum, i) => sum + i.quantity * i.sellingRate, 0));

  if (!isSubsidyBased) {
    return {
      subtotal,
      eligibleAmount: 0,
      subsidyAmount: 0,
      farmerContribution: subtotal,
      nonEligibleAmount: subtotal,
    };
  }

  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);
  const cap = maximumEligibleQuantity != null ? Math.min(maximumEligibleQuantity, totalQty) : totalQty;

  let remainingEligibleQty = cap;
  let eligibleAmount = 0;
  let nonEligibleAmount = 0;

  for (const item of items) {
    const rate = item.governmentRate ?? item.sellingRate;
    const eligibleQtyForItem = Math.max(0, Math.min(item.quantity, remainingEligibleQty));
    const ineligibleQtyForItem = item.quantity - eligibleQtyForItem;

    eligibleAmount += eligibleQtyForItem * rate;
    nonEligibleAmount += ineligibleQtyForItem * item.sellingRate;

    remainingEligibleQty -= eligibleQtyForItem;
  }

  eligibleAmount = round2(eligibleAmount);
  nonEligibleAmount = round2(subtotal - eligibleAmount);

  const subsidyAmount = round2(eligibleAmount * (subsidyPercentage / 100));
  const farmerContribution = round2(subtotal - subsidyAmount);

  return {
    subtotal,
    eligibleAmount,
    subsidyAmount,
    farmerContribution,
    nonEligibleAmount,
  };
}

/** GST split: CGST+SGST for intra-Maharashtra sales, IGST for interstate. */
export function calculateGst(taxableAmount: number, gstRate: number, isInterstate: boolean) {
  const gstAmount = round2(taxableAmount * (gstRate / 100));
  if (isInterstate) {
    return { cgst: 0, sgst: 0, igst: gstAmount, gstAmount };
  }
  const half = round2(gstAmount / 2);
  return { cgst: half, sgst: round2(gstAmount - half), igst: 0, gstAmount };
}

export { round2 };

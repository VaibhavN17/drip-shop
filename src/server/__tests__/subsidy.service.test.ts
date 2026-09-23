import { describe, it, expect } from "vitest";
import { calculateSubsidy, calculateItemTotals, calculateGst } from "@server/services/subsidy.service";

describe("calculateItemTotals", () => {
  it("computes line amounts and subtotal", () => {
    const { subtotal, itemAmounts } = calculateItemTotals([
      { quantity: 3300, sellingRate: 13.5 },
      { quantity: 1, sellingRate: 3100 },
    ]);
    expect(itemAmounts).toEqual([44550, 3100]);
    expect(subtotal).toBe(47650);
  });
});

describe("calculateSubsidy", () => {
  it("returns full farmer contribution when not subsidy-based", () => {
    const result = calculateSubsidy({
      items: [{ quantity: 10, sellingRate: 100 }],
      subsidyPercentage: 80,
      isSubsidyBased: false,
    });
    expect(result.subsidyAmount).toBe(0);
    expect(result.farmerContribution).toBe(1000);
  });

  it("caps eligible quantity at the scheme maximum", () => {
    const result = calculateSubsidy({
      items: [{ quantity: 3300, sellingRate: 13.5, governmentRate: 13.5 }],
      subsidyPercentage: 80,
      maximumEligibleQuantity: 2000,
      isSubsidyBased: true,
    });
    // eligible: 2000 * 13.5 = 27000; subsidy: 27000*0.8=21600
    expect(result.eligibleAmount).toBe(27000);
    expect(result.subsidyAmount).toBe(21600);
    expect(result.nonEligibleAmount).toBe(result.subtotal - 27000);
  });

  it("uses full quantity when no cap is set", () => {
    const result = calculateSubsidy({
      items: [{ quantity: 100, sellingRate: 50, governmentRate: 40 }],
      subsidyPercentage: 50,
      isSubsidyBased: true,
    });
    expect(result.eligibleAmount).toBe(4000); // 100 * 40
    expect(result.subsidyAmount).toBe(2000);
    expect(result.farmerContribution).toBe(3000); // subtotal(5000) - subsidy(2000)
  });
});

describe("calculateGst", () => {
  it("splits into CGST+SGST for intra-state", () => {
    const r = calculateGst(1000, 18, false);
    expect(r.cgst).toBe(90);
    expect(r.sgst).toBe(90);
    expect(r.igst).toBe(0);
    expect(r.gstAmount).toBe(180);
  });

  it("uses IGST for interstate", () => {
    const r = calculateGst(1000, 18, true);
    expect(r.igst).toBe(180);
    expect(r.cgst).toBe(0);
  });
});

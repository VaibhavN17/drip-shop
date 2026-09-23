import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";
import { amountInWords } from "@server/utils/numberFormat";

/**
 * Quotation PDF, generated with @react-pdf/renderer — a pure JS/WASM
 * renderer with no headless-Chromium dependency, so it runs fine inside a
 * Vercel serverless function. Layout is isolated in this file so the
 * rendering engine can be swapped later without touching business logic.
 */

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", borderBottom: "2 solid #15803d", paddingBottom: 8, marginBottom: 8 },
  shopName: { fontSize: 16, fontWeight: 700, color: "#15803d" },
  small: { fontSize: 8, color: "#444" },
  title: { fontSize: 12, fontWeight: 700, textAlign: "center", marginVertical: 8, textTransform: "uppercase", letterSpacing: 1 },
  metaRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  section: { marginBottom: 8, border: "1 solid #ddd", padding: 6, borderRadius: 2 },
  sectionTitle: { fontSize: 8, fontWeight: 700, marginBottom: 3, color: "#15803d", textTransform: "uppercase" },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  table: { marginTop: 4 },
  tHeadRow: { flexDirection: "row", backgroundColor: "#15803d", color: "#fff", paddingVertical: 4 },
  tRow: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3 },
  tRowAlt: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, backgroundColor: "#f7f7f7" },
  cSr: { width: "6%", paddingHorizontal: 2 },
  cDesc: { width: "38%", paddingHorizontal: 2 },
  cQty: { width: "12%", paddingHorizontal: 2, textAlign: "right" },
  cUnit: { width: "10%", paddingHorizontal: 2 },
  cRate: { width: "17%", paddingHorizontal: 2, textAlign: "right" },
  cAmt: { width: "17%", paddingHorizontal: 2, textAlign: "right" },
  totalsBox: { marginTop: 6, alignSelf: "flex-end", width: "45%" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalsRowBold: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderTop: "1 solid #333", marginTop: 2, fontWeight: 700 },
  subsidyBox: { marginTop: 10, border: "1 solid #15803d", padding: 6, borderRadius: 2, backgroundColor: "#f0fdf4" },
  footer: { marginTop: 24, flexDirection: "row", justifyContent: "space-between" },
  footerNote: { fontSize: 7, color: "#666", marginTop: 16 },
});

function inr(n: number | string | null | undefined) {
  const num = Number(n ?? 0);
  return "\u20B9 " + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface QuotationPdfProps {
  shop: {
    shopName: string;
    address?: string | null;
    mobile?: string | null;
    gstin?: string | null;
    footerText?: string | null;
    termsAndConditions?: string | null;
  };
  quotation: {
    quotationNumber: string;
    quotationDate: string;
    validUntil?: string | null;
    subtotal: number;
    fileExpense: number;
    otherCharges: number;
    gstRate: number;
    gstAmount: number;
    totalAmount: number;
    isSubsidyBased: boolean;
    subsidyPercentage?: number | null;
    eligibleAmount?: number | null;
    subsidyAmount?: number | null;
    farmerContribution?: number | null;
    landArea?: number | null;
  };
  customer: {
    fullName: string;
    mobile: string;
    address?: string | null;
    village?: string | null;
    taluka?: string | null;
    district?: string | null;
    surveyNumber?: string | null;
    gatNumber?: string | null;
  };
  items: Array<{ description: string; quantity: number; unit: string; sellingRate: number; amount: number }>;
}

export function QuotationPdfDocument({ shop, quotation, customer, items }: QuotationPdfProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.shopName}>{shop.shopName}</Text>
            {shop.address ? <Text style={styles.small}>{shop.address}</Text> : null}
            <Text style={styles.small}>
              {shop.mobile ? `Mob: ${shop.mobile}` : ""} {shop.gstin ? `  |  GSTIN: ${shop.gstin}` : ""}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.small}>Quotation No: {quotation.quotationNumber}</Text>
            <Text style={styles.small}>Date: {new Date(quotation.quotationDate).toLocaleDateString("en-IN")}</Text>
            {quotation.validUntil ? (
              <Text style={styles.small}>Valid Until: {new Date(quotation.validUntil).toLocaleDateString("en-IN")}</Text>
            ) : null}
          </View>
        </View>

        <Text style={styles.title}>Drip Irrigation Quotation</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Details</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text>Name: {customer.fullName}</Text>
              <Text>Mobile: {customer.mobile}</Text>
              <Text>Address: {customer.address ?? "-"}</Text>
            </View>
            <View style={styles.col}>
              <Text>Village: {customer.village ?? "-"}   Taluka: {customer.taluka ?? "-"}</Text>
              <Text>District: {customer.district ?? "-"}</Text>
              <Text>
                Survey/Gat No: {customer.surveyNumber ?? customer.gatNumber ?? "-"}
                {quotation.landArea ? `   Land Area: ${quotation.landArea}` : ""}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={styles.cSr}>Sr</Text>
            <Text style={styles.cDesc}>Description</Text>
            <Text style={styles.cQty}>Qty</Text>
            <Text style={styles.cUnit}>Unit</Text>
            <Text style={styles.cRate}>Rate</Text>
            <Text style={styles.cAmt}>Amount</Text>
          </View>
          {items.map((item, idx) => (
            <View key={idx} style={idx % 2 ? styles.tRowAlt : styles.tRow}>
              <Text style={styles.cSr}>{idx + 1}</Text>
              <Text style={styles.cDesc}>{item.description}</Text>
              <Text style={styles.cQty}>{item.quantity}</Text>
              <Text style={styles.cUnit}>{item.unit}</Text>
              <Text style={styles.cRate}>{inr(item.sellingRate)}</Text>
              <Text style={styles.cAmt}>{inr(item.amount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}>
            <Text>Subtotal</Text>
            <Text>{inr(quotation.subtotal)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>File Expense</Text>
            <Text>{inr(quotation.fileExpense)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>Other Charges</Text>
            <Text>{inr(quotation.otherCharges)}</Text>
          </View>
          <View style={styles.totalsRow}>
            <Text>GST ({Number(quotation.gstRate)}%)</Text>
            <Text>{inr(quotation.gstAmount)}</Text>
          </View>
          <View style={styles.totalsRowBold}>
            <Text>Grand Total</Text>
            <Text>{inr(quotation.totalAmount)}</Text>
          </View>
        </View>

        {quotation.isSubsidyBased ? (
          <View style={styles.subsidyBox}>
            <Text style={styles.sectionTitle}>Subsidy Details</Text>
            <View style={styles.row}>
              <Text style={styles.col}>Subsidy %: {Number(quotation.subsidyPercentage ?? 0)}%</Text>
              <Text style={styles.col}>Eligible Amount: {inr(quotation.eligibleAmount)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.col}>Government Contribution: {inr(quotation.subsidyAmount)}</Text>
              <Text style={styles.col}>Farmer Contribution: {inr(quotation.farmerContribution)}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.footer}>
          <View style={{ width: "55%" }}>
            <Text style={styles.sectionTitle}>Terms and Conditions</Text>
            <Text style={styles.small}>
              {shop.termsAndConditions ?? "Prices valid as per government/scheme rates on the date of this quotation. Subject to stock availability."}
            </Text>
          </View>
          <View style={{ width: "35%", alignItems: "flex-end" }}>
            <Text style={{ marginTop: 40 }}>Authorized Signature</Text>
            <Text style={styles.small}>(Shop Stamp)</Text>
          </View>
        </View>

        {shop.footerText ? <Text style={styles.footerNote}>{shop.footerText}</Text> : null}
      </Page>
    </Document>
  );
}

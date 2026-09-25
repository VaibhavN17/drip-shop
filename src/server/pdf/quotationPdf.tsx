import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { amountInWords } from "@server/utils/numberFormat";

const GREEN = "#15803d";
const LIGHT_GREEN = "#f0fdf4";
const BORDER = "#ccc";

const S = StyleSheet.create({
  page:         { padding: 30, fontSize: 9, fontFamily: "Helvetica", color: "#111", backgroundColor: "#fff" },
  mobileHeader: { textAlign: "right", fontSize: 8, color: "#555", marginBottom: 6 },
  infoBox:      { border: "1 solid #ccc", marginBottom: 6 },
  infoRow:      { flexDirection: "row", borderBottom: "0.5 solid #ccc", padding: "3 6" },
  infoLabel:    { width: "18%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  infoValue:    { flex: 1, fontSize: 8.5 },
  infoSep:      { width: "4%", textAlign: "center", color: "#999" },
  infoLabel2:   { width: "14%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  infoValue2:   { width: "20%", fontSize: 8.5 },
  shopName:     { fontSize: 15, fontFamily: "Helvetica-Bold", color: "#15803d", textAlign: "center", marginBottom: 2 },
  shopSub:      { fontSize: 8, color: "#555", textAlign: "center", marginBottom: 4 },
  docTitle:     { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "center",
                  backgroundColor: "#15803d", color: "#fff", paddingVertical: 4, marginBottom: 0,
                  letterSpacing: 1, textTransform: "uppercase" },
  tHead:        { flexDirection: "row", backgroundColor: "#333", color: "#fff", paddingVertical: 4, paddingHorizontal: 2 },
  tRow:         { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, paddingHorizontal: 2 },
  tRowAlt:      { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, paddingHorizontal: 2, backgroundColor: "#f9f9f9" },
  cSr:          { width: "7%", textAlign: "center" },
  cDesc:        { width: "43%", paddingHorizontal: 2 },
  cQty:         { width: "14%", textAlign: "right", paddingRight: 4 },
  cRate:        { width: "18%", textAlign: "right", paddingRight: 4 },
  cAmt:         { width: "18%", textAlign: "right", paddingRight: 4 },
  totWrap:      { marginTop: 4, alignSelf: "flex-end", width: "48%", border: "1 solid #ccc" },
  totRow:       { flexDirection: "row", justifyContent: "space-between", paddingVertical: 3, paddingHorizontal: 6, borderBottom: "0.5 solid #eee" },
  totRowBold:   { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, paddingHorizontal: 6,
                  backgroundColor: "#1a1a1a", color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 10.5 },
  subsidyWrap:  { marginTop: 10, border: "1.5 solid #15803d", borderRadius: 3, backgroundColor: "#f0fdf4", padding: 8 },
  subsidyTitle: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#15803d", marginBottom: 5,
                  textTransform: "uppercase", letterSpacing: 0.5 },
  subsidyRow:   { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  subsidyLabel: { fontSize: 9, color: "#333" },
  subsidyValue: { fontSize: 9, fontFamily: "Helvetica-Bold", color: "#1a1a1a" },
  subsidyFarmer:{ flexDirection: "row", justifyContent: "space-between", marginTop: 4, paddingTop: 4, borderTop: "1 solid #15803d" },
  subsidyFLabel:{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#15803d" },
  subsidyFValue:{ fontSize: 12, fontFamily: "Helvetica-Bold", color: "#15803d" },
  footer:       { marginTop: 24, flexDirection: "row", justifyContent: "space-between" },
  termsTitle:   { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#555", marginBottom: 2 },
  termsText:    { fontSize: 7.5, color: "#666", lineHeight: 1.4 },
  sigBox:       { alignItems: "flex-end" },
  sigLine:      { marginTop: 36, width: 120, borderBottom: "1 solid #333" },
  sigLabel:     { fontSize: 8, color: "#555", marginTop: 2, textAlign: "right" },
  footNote:     { fontSize: 7, color: "#888", marginTop: 14, textAlign: "center" },
});

function inr(n: number | string | null | undefined): string {
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
    notes?: string | null;
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
    aadharNumber?: string | null;
    aadhaarLast4?: string | null;
    crop?: string | null;
    notes?: string | null;
  };
  items: Array<{ description: string; quantity: number; unit: string; sellingRate: number; amount: number }>;
}

export function QuotationPdfDocument({ shop, quotation, customer, items }: QuotationPdfProps) {
  const qDate = new Date(quotation.quotationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
  
  // Extract spacing, aadhar, crop from notes if available
  const notesText = quotation.notes ?? "";
  const spacingMatch = notesText.match(/Spacing[^\d]*([0-9.]+\s*x\s*[0-9.]+)/i);
  const spacing = spacingMatch ? spacingMatch[1] : null;

  const aadharMatch = notesText.match(/Aadhaar[:\s]*([0-9\s]{12,14})/i);
  const aadhar = aadharMatch ? aadharMatch[1] : (customer.aadharNumber ?? (customer.aadhaarLast4 ? `XXXX-XXXX-${customer.aadhaarLast4}` : "-"));

  return (
    <Document>
      <Page size="A4" style={S.page}>
        <Text style={S.mobileHeader}>
          {shop.mobile ? `Mobile: ${shop.mobile}` : "Mobile: 8766420075, 8888309342, 9545595944"}
        </Text>
        <View style={S.infoBox}>
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>Name (Nav) :-</Text>
            <Text style={S.infoValue}>{customer.fullName}</Text>
            <Text style={S.infoSep}></Text>
            <Text style={S.infoLabel2}>Gat / Sr :-</Text>
            <Text style={S.infoValue2}>{customer.gatNumber ?? customer.surveyNumber ?? "-"}</Text>
          </View>
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>Aadhar :-</Text>
            <Text style={S.infoValue}>{aadhar}</Text>
            <Text style={S.infoSep}></Text>
            <Text style={S.infoLabel2}>Qtn No :-</Text>
            <Text style={S.infoValue2}>{quotation.quotationNumber}</Text>
          </View>
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>Address (Patta) :-</Text>
            <Text style={S.infoValue}>{[customer.address, customer.village, customer.taluka, customer.district].filter(Boolean).join(", ")}</Text>
            <Text style={S.infoSep}></Text>
            <Text style={S.infoLabel2}>Date :-</Text>
            <Text style={S.infoValue2}>{qDate}</Text>
          </View>
          <View style={S.infoRow}>
            <Text style={S.infoLabel}>Mobile :-</Text>
            <Text style={S.infoValue}>{customer.mobile}</Text>
            <Text style={S.infoSep}></Text>
            <Text style={S.infoLabel2}>{spacing ? `Spacing: ${spacing}` : "Crop:"}</Text>
            <Text style={S.infoValue2}>{quotation.landArea ? `${quotation.landArea} Ha/Acre` : (customer.crop ?? "-")}</Text>
          </View>
        </View>
        <Text style={S.shopName}>{shop.shopName || "SHETKARI RAJA MORE HARDWARE"}</Text>
        {shop.address ? <Text style={S.shopSub}>{shop.address}{shop.gstin ? `  |  GSTIN: ${shop.gstin}` : ""}</Text> : null}
        <Text style={S.docTitle}>SONA DRIP QUOTATION</Text>
        <View style={S.tHead}>
          <Text style={S.cSr}>Sr. No.</Text>
          <Text style={S.cDesc}>Description</Text>
          <Text style={S.cQty}>Qty</Text>
          <Text style={S.cRate}>Rate</Text>
          <Text style={S.cAmt}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={idx % 2 === 0 ? S.tRow : S.tRowAlt}>
            <Text style={S.cSr}>{idx + 1}</Text>
            <Text style={S.cDesc}>{item.description}</Text>
            <Text style={S.cQty}>{item.quantity}</Text>
            <Text style={S.cRate}>{inr(item.sellingRate)}</Text>
            <Text style={S.cAmt}>{inr(item.amount)}</Text>
          </View>
        ))}
        <View style={S.totWrap}>
          <View style={S.totRow}><Text>Subtotal</Text><Text>{inr(quotation.subtotal)}</Text></View>
          {quotation.fileExpense > 0 && <View style={S.totRow}><Text>File Exp</Text><Text>{inr(quotation.fileExpense)}</Text></View>}
          {quotation.otherCharges > 0 && <View style={S.totRow}><Text>Other Charges</Text><Text>{inr(quotation.otherCharges)}</Text></View>}
          <View style={S.totRow}><Text>ADD GST @{Number(quotation.gstRate)}%</Text><Text>{inr(quotation.gstAmount)}</Text></View>
          <View style={S.totRowBold}><Text>Total Amt</Text><Text>{inr(quotation.totalAmount)}</Text></View>
        </View>
        {quotation.isSubsidyBased && (
          <View style={S.subsidyWrap}>
            <Text style={S.subsidyTitle}>Government Subsidy (Anudan)</Text>
            <View style={S.subsidyRow}>
              <Text style={S.subsidyLabel}>Subsidy % (Anudan Takka)</Text>
              <Text style={S.subsidyValue}>{Number(quotation.subsidyPercentage ?? 0)}%</Text>
            </View>
            <View style={S.subsidyRow}>
              <Text style={S.subsidyLabel}>Eligible Amount (Patra Rakkam)</Text>
              <Text style={S.subsidyValue}>{inr(quotation.eligibleAmount)}</Text>
            </View>
            <View style={S.subsidyRow}>
              <Text style={S.subsidyLabel}>Anudan Vaja {Number(quotation.subsidyPercentage ?? 0)}% (Govt. Contribution)</Text>
              <Text style={S.subsidyValue}>{inr(quotation.subsidyAmount)}</Text>
            </View>
            <View style={S.subsidyFarmer}>
              <Text style={S.subsidyFLabel}>Shetkari Bharna (Farmer Pays)</Text>
              <Text style={S.subsidyFValue}>{inr(quotation.farmerContribution)}</Text>
            </View>
          </View>
        )}
        <View style={S.footer}>
          <View style={{ width: "58%" }}>
            <Text style={S.termsTitle}>Terms and Conditions</Text>
            <Text style={S.termsText}>{shop.termsAndConditions ?? "Prices are subject to change without prior notice. Goods once sold will not be taken back. Subject to stock availability. Quotation valid for 30 days."}</Text>
          </View>
          <View style={S.sigBox}>
            <View style={S.sigLine} />
            <Text style={S.sigLabel}>Authorized Signature</Text>
            <Text style={[S.sigLabel, { marginTop: 2 }]}>(Shop Stamp and Seal)</Text>
          </View>
        </View>
        {shop.footerText ? <Text style={S.footNote}>{shop.footerText}</Text> : null}
      </Page>
    </Document>
  );
}

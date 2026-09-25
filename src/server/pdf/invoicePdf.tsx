import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { amountInWords } from "@server/utils/numberFormat";

/**
 * Tax Invoice PDF — matches the GST Tax Invoice format from the real photo:
 * shop header with GSTIN → TAX INVOICE title → customer grid →
 * items table (Sr/Description/HSN/Size/Qty/Govt Rate/Actual Rate/Amount) →
 * GST summary (Gross/CGST/SGST/Total GST/Bill Amt) →
 * right-side totals (Subtotal/Discount/Installation/Total GST/Round Off/Bill Amt) →
 * amount-in-words → payment details → signature
 */

const BLUE = "#1d4ed8";
const LIGHT_BLUE = "#eff6ff";

const S = StyleSheet.create({
  page:        { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#111", backgroundColor: "#fff" },

  /* ── Shop Header ── */
  headerWrap:  { marginBottom: 6, borderBottom: "2 solid #1d4ed8", paddingBottom: 6 },
  shopName:    { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#1d4ed8", textAlign: "center" },
  shopAddr:    { fontSize: 8, color: "#444", textAlign: "center" },
  shopGstin:   { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#b91c1c", textAlign: "center", marginTop: 1 },

  /* ── Meta row: Reverse Charge / Place of Supply / Invoice No / Date ── */
  metaBox:     { flexDirection: "row", border: "1 solid #ddd", marginBottom: 4 },
  metaLeft:    { flex: 1, padding: "3 5", borderRight: "0.5 solid #ddd" },
  metaRight:   { flex: 1, padding: "3 5" },
  metaLine:    { fontSize: 8, marginBottom: 1 },
  metaBold:    { fontSize: 8, fontFamily: "Helvetica-Bold" },

  /* ── Title ── */
  docTitle:    { fontSize: 13, fontFamily: "Helvetica-Bold", textAlign: "center",
                 letterSpacing: 2, textTransform: "uppercase",
                 color: "#1d4ed8", marginVertical: 5 },

  /* ── Customer info ── */
  custBox:     { border: "1 solid #ddd", marginBottom: 5 },
  custRow:     { flexDirection: "row", borderBottom: "0.5 solid #ddd", padding: "3 5" },
  custLabel:   { width: "22%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  custValue:   { flex: 1, fontSize: 8.5 },
  custLabel2:  { width: "14%", fontFamily: "Helvetica-Bold", fontSize: 8.5 },
  custValue2:  { width: "24%", fontSize: 8.5 },

  /* ── Items table ── */
  tHead:       { flexDirection: "row", backgroundColor: "#1d4ed8", color: "#fff", paddingVertical: 4, paddingHorizontal: 2 },
  tRow:        { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, paddingHorizontal: 2 },
  tRowAlt:     { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, paddingHorizontal: 2, backgroundColor: "#f8faff" },
  cSr:         { width: "5%", textAlign: "center" },
  cDesc:       { width: "28%", paddingHorizontal: 2 },
  cHsn:        { width: "10%", textAlign: "center" },
  cSize:       { width: "9%", textAlign: "center" },
  cQty:        { width: "8%", textAlign: "right", paddingRight: 2 },
  cUnit:       { width: "6%", textAlign: "center" },
  cGovRate:    { width: "12%", textAlign: "right", paddingRight: 2 },
  cRate:       { width: "10%", textAlign: "right", paddingRight: 2 },
  cAmt:        { width: "12%", textAlign: "right", paddingRight: 2 },

  /* ── GST Summary table + Right totals side-by-side ── */
  summaryRow:  { flexDirection: "row", marginTop: 6, gap: 8 },

  gstTable:    { flex: 1, border: "1 solid #ddd" },
  gstHeadRow:  { flexDirection: "row", backgroundColor: "#374151", color: "#fff", paddingVertical: 3 },
  gstRow:      { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 2 },
  gCol:        { flex: 1, textAlign: "center", fontSize: 8 },

  totBox:      { width: "42%", border: "1 solid #ddd" },
  totRow:      { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2, paddingHorizontal: 5, borderBottom: "0.5 solid #eee" },
  totLabel:    { fontSize: 8.5, color: "#333" },
  totValue:    { fontSize: 8.5, fontFamily: "Helvetica-Bold" },
  totFinalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5, paddingHorizontal: 5,
                 backgroundColor: "#1d4ed8", color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 11 },

  /* ── Amount in words ── */
  wordsBox:    { marginTop: 5, padding: "3 5", backgroundColor: "#f0f9ff", border: "1 solid #bfdbfe" },
  wordsText:   { fontSize: 8.5, fontStyle: "italic" },

  /* ── Certification / footer ── */
  certBox:     { marginTop: 8, border: "1 solid #ddd", padding: "5 6", backgroundColor: "#fafafa" },
  certText:    { fontSize: 7.5, color: "#555", lineHeight: 1.4 },

  footer:      { marginTop: 10, flexDirection: "row", justifyContent: "space-between" },
  payBox:      { width: "55%" },
  payTitle:    { fontSize: 8, fontFamily: "Helvetica-Bold", color: "#1d4ed8", marginBottom: 2 },
  payLine:     { fontSize: 8, color: "#444", marginBottom: 1 },
  sigBox:      { width: "38%", alignItems: "flex-end" },
  sigLine:     { marginTop: 30, width: 130, borderBottom: "1 solid #333" },
  sigLabel:    { fontSize: 8, color: "#555", marginTop: 2, textAlign: "right" },
  footNote:    { fontSize: 7, color: "#888", marginTop: 10, textAlign: "center" },
});

function inr(n: number | string | null | undefined): string {
  const num = Number(n ?? 0);
  return "\u20B9 " + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface InvoicePdfProps {
  shop: {
    shopName: string;
    address?: string | null;
    mobile?: string | null;
    gstin?: string | null;
    state?: string | null;
    footerText?: string | null;
    bankName?: string | null;
    bankAccountNumber?: string | null;
    bankIfsc?: string | null;
    upiId?: string | null;
  };
  invoice: {
    invoiceNumber: string;
    invoiceDate: string;
    subtotal: number;
    cgst: number;
    sgst: number;
    igst: number;
    gstAmount: number;
    discount: number;
    roundOff: number;
    totalAmount: number;
    isInterstate?: boolean;
    gstRate?: number;
    notes?: string | null;
  };
  customer: {
    fullName: string;
    mobile: string;
    address?: string | null;
    village?: string | null;
    taluka?: string | null;
    district?: string | null;
    state?: string | null;
    gatNumber?: string | null;
    surveyNumber?: string | null;
    landArea?: number | null;
    crop?: string | null;
    notes?: string | null;
  };
  items: Array<{
    description: string;
    hsnCode?: string | null;
    batchNo?: string | null;
    cmlNo?: string | null;
    size?: string | null;
    quantity: number;
    unit: string;
    rate: number;
    taxableValue: number;
    cgstAmount: number;
    sgstAmount: number;
    totalAmount: number;
  }>;
}

export function InvoicePdfDocument({ shop, invoice, customer, items }: InvoicePdfProps) {
  const iDate = new Date(invoice.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
  const gstRate = invoice.gstRate ?? (items.length > 0 && items[0].taxableValue > 0 ? Math.round((items[0].cgstAmount / items[0].taxableValue) * 100 * 2) : 5);

  const notesText = invoice.notes ?? "";
  const setTypeMatch = notesText.match(/संच प्रकार[:\s]*([^\s|]+)/i);
  const setType = setTypeMatch ? setTypeMatch[1] : "Drip / ठिबक";

  const spacingMatch = notesText.match(/लागवडीचे अंतर[:\s]*([0-9.]+\s*x\s*[0-9.]+[^|]*)/i);
  const spacing = spacingMatch ? spacingMatch[1].trim() : "-";

  const shiwarMatch = notesText.match(/शिवार[:\s]*([^|]+)/i);
  const shiwar = shiwarMatch ? shiwarMatch[1].trim() : "-";

  return (
    <Document>
      <Page size="A4" style={S.page}>

        {/* ── Shop Header ── */}
        <View style={S.headerWrap}>
          <Text style={S.shopName}>{shop.shopName || "SONA IRRIGATION / SHETKARI RAJA MORE HARDWARE"}</Text>
          <Text style={S.shopAddr}>Authorized Dealer: Sona Poly Plast Pvt. Ltd.</Text>
          {shop.address ? <Text style={S.shopAddr}>{shop.address}</Text> : null}
          <Text style={S.shopAddr}>Mob: {shop.mobile || "9420032642, 8766420075"}</Text>
          <Text style={S.shopGstin}>GSTIN: {shop.gstin || "27ABVPT3736N1Z9"}</Text>
        </View>

        {/* ── Meta: Reverse Charge / Place of Supply / Invoice No / Date ── */}
        <View style={S.metaBox}>
          <View style={S.metaLeft}>
            <Text style={S.metaLine}>Under Jurisdiction of: Kopargaon</Text>
            <Text style={S.metaLine}>Reverse Charge: No  |  Place of Supply: 27 - Maharashtra</Text>
            <Text style={S.metaBold}>Set Type (Sanch Prakar): {setType}</Text>
          </View>
          <View style={S.metaRight}>
            <Text style={S.metaBold}>Bill No.: <Text style={{ color: "#b91c1c" }}>{invoice.invoiceNumber}</Text></Text>
            <Text style={S.metaLine}>Date: {iDate}</Text>
            <Text style={S.metaLine}>State: {shop.state ?? "27 - Maharashtra"}</Text>
          </View>
        </View>

        {/* ── Title ── */}
        <Text style={S.docTitle}>TAX INVOICE</Text>

        {/* ── Customer Info ── */}
        <View style={S.custBox}>
          <View style={S.custRow}>
            <Text style={S.custLabel}>Farmer's Name:</Text>
            <Text style={S.custValue}>{customer.fullName}</Text>
            <Text style={S.custLabel2}>Village (Gao):</Text>
            <Text style={S.custValue2}>{customer.village ?? "-"}</Text>
          </View>
          <View style={S.custRow}>
            <Text style={S.custLabel}>Mobile No.:</Text>
            <Text style={S.custValue}>{customer.mobile}</Text>
            <Text style={S.custLabel2}>Shiwar:</Text>
            <Text style={S.custValue2}>{shiwar}</Text>
          </View>
          <View style={S.custRow}>
            <Text style={S.custLabel}>Taluka / District:</Text>
            <Text style={S.custValue}>{customer.taluka ?? "-"}, {customer.district ?? "-"}</Text>
            <Text style={S.custLabel2}>Gat / Sr No.:</Text>
            <Text style={S.custValue2}>{customer.gatNumber ?? customer.surveyNumber ?? "-"}</Text>
          </View>
          <View style={S.custRow}>
            <Text style={S.custLabel}>Area & Crop:</Text>
            <Text style={S.custValue}>{customer.landArea ? `${customer.landArea} Ha/Acre` : "-"} | Crop: {customer.crop ?? "-"}</Text>
            <Text style={S.custLabel2}>Spacing:</Text>
            <Text style={S.custValue2}>{spacing}</Text>
          </View>
        </View>

        {/* ── Items Table ── */}
        <View style={S.tHead}>
          <Text style={S.cSr}>Sr</Text>
          <Text style={S.cDesc}>Product Description</Text>
          <Text style={S.cHsn}>HSN / BIS</Text>
          <Text style={S.cSize}>Size</Text>
          <Text style={S.cQty}>Qty</Text>
          <Text style={S.cUnit}>Unit</Text>
          <Text style={S.cGovRate}>Govt. Rate</Text>
          <Text style={S.cRate}>Rate</Text>
          <Text style={S.cAmt}>Amount</Text>
        </View>
        {items.map((item, idx) => (
          <View key={idx} style={idx % 2 === 0 ? S.tRow : S.tRowAlt}>
            <Text style={S.cSr}>{idx + 1}</Text>
            <Text style={S.cDesc}>{item.description}</Text>
            <Text style={S.cHsn}>{item.hsnCode ?? "-"}</Text>
            <Text style={S.cSize}>-</Text>
            <Text style={S.cQty}>{item.quantity}</Text>
            <Text style={S.cUnit}>{item.unit}</Text>
            <Text style={S.cGovRate}>{inr(item.rate)}</Text>
            <Text style={S.cRate}>{inr(item.rate)}</Text>
            <Text style={S.cAmt}>{inr(item.taxableValue)}</Text>
          </View>
        ))}

        {/* ── GST Summary + Right Totals ── */}
        <View style={S.summaryRow}>
          {/* GST breakdown table */}
          <View style={S.gstTable}>
            <View style={S.gstHeadRow}>
              <Text style={[S.gCol, { fontFamily: "Helvetica-Bold" }]}>GST</Text>
              <Text style={[S.gCol, { fontFamily: "Helvetica-Bold" }]}>Gross Amt</Text>
              <Text style={[S.gCol, { fontFamily: "Helvetica-Bold" }]}>CGST Rate</Text>
              <Text style={[S.gCol, { fontFamily: "Helvetica-Bold" }]}>CGST Amt</Text>
              <Text style={[S.gCol, { fontFamily: "Helvetica-Bold" }]}>SGST Rate</Text>
              <Text style={[S.gCol, { fontFamily: "Helvetica-Bold" }]}>SGST Amt</Text>
              <Text style={[S.gCol, { fontFamily: "Helvetica-Bold" }]}>Total GST</Text>
              <Text style={[S.gCol, { fontFamily: "Helvetica-Bold" }]}>Bill Amt</Text>
            </View>
            <View style={S.gstRow}>
              <Text style={S.gCol}>{gstRate}%</Text>
              <Text style={S.gCol}>{inr(invoice.subtotal)}</Text>
              <Text style={S.gCol}>{Number(gstRate) / 2}%</Text>
              <Text style={S.gCol}>{inr(invoice.cgst)}</Text>
              <Text style={S.gCol}>{Number(gstRate) / 2}%</Text>
              <Text style={S.gCol}>{inr(invoice.sgst)}</Text>
              <Text style={S.gCol}>{inr(invoice.gstAmount)}</Text>
              <Text style={S.gCol}>{inr(invoice.totalAmount)}</Text>
            </View>
          </View>

          {/* Right totals column */}
          <View style={S.totBox}>
            <View style={S.totRow}>
              <Text style={S.totLabel}>Gross Amount (Ekun Rakkam)</Text>
              <Text style={S.totValue}>{inr(invoice.subtotal)}</Text>
            </View>
            <View style={S.totRow}>
              <Text style={S.totLabel}>Discount</Text>
              <Text style={S.totValue}>{inr(invoice.discount)}</Text>
            </View>
            <View style={S.totRow}>
              <Text style={S.totLabel}>Installation</Text>
              <Text style={S.totValue}>0</Text>
            </View>
            <View style={S.totRow}>
              <Text style={S.totLabel}>Total GST (Ekun GST)</Text>
              <Text style={S.totValue}>{inr(invoice.gstAmount)}</Text>
            </View>
            <View style={S.totRow}>
              <Text style={S.totLabel}>Round Off</Text>
              <Text style={S.totValue}>{inr(invoice.roundOff)}</Text>
            </View>
            <View style={S.totFinalRow}>
              <Text>Bill Amount</Text>
              <Text>{inr(invoice.totalAmount)}</Text>
            </View>
          </View>
        </View>

        {/* ── Amount in Words ── */}
        <View style={S.wordsBox}>
          <Text style={S.wordsText}>Amount in Words: {amountInWords(invoice.totalAmount)}</Text>
        </View>

        {/* ── Footer ── */}
        <View style={S.footer}>
          <View style={S.payBox}>
            <Text style={S.payTitle}>Payment Details</Text>
            {shop.bankName ? <Text style={S.payLine}>Bank: {shop.bankName}</Text> : null}
            {shop.bankAccountNumber ? <Text style={S.payLine}>A/c No: {shop.bankAccountNumber}</Text> : null}
            {shop.bankIfsc ? <Text style={S.payLine}>IFSC: {shop.bankIfsc}</Text> : null}
            {shop.upiId ? <Text style={S.payLine}>UPI: {shop.upiId}</Text> : null}
            <Text style={[S.payLine, { marginTop: 6, fontSize: 7.5, color: "#666", lineHeight: 1.4 }]}>
              Certification: The financial transaction for this invoice has been done between the farmer and the distributor and the distributor is responsible for it. As per government norms, all the components/quantities of this invoice must be submitted for verification.
            </Text>
          </View>
          <View style={S.sigBox}>
            <View style={S.sigLine} />
            <Text style={S.sigLabel}>Authorized Signature</Text>
            <Text style={[S.sigLabel, { marginTop: 1 }]}>(Stamp and Seal)</Text>
          </View>
        </View>

        {shop.footerText ? <Text style={S.footNote}>{shop.footerText}</Text> : null}
      </Page>
    </Document>
  );
}

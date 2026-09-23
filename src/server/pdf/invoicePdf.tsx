import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { amountInWords } from "@server/utils/numberFormat";

const styles = StyleSheet.create({
  page: { padding: 28, fontSize: 9, fontFamily: "Helvetica", color: "#1a1a1a" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", borderBottom: "2 solid #1d4ed8", paddingBottom: 8, marginBottom: 8 },
  shopName: { fontSize: 16, fontWeight: 700, color: "#1d4ed8" },
  small: { fontSize: 8, color: "#444" },
  title: { fontSize: 12, fontWeight: 700, textAlign: "center", marginVertical: 8, textTransform: "uppercase", letterSpacing: 1 },
  section: { marginBottom: 8, border: "1 solid #ddd", padding: 6, borderRadius: 2 },
  sectionTitle: { fontSize: 8, fontWeight: 700, marginBottom: 3, color: "#1d4ed8", textTransform: "uppercase" },
  row: { flexDirection: "row" },
  col: { flex: 1 },
  table: { marginTop: 4 },
  tHeadRow: { flexDirection: "row", backgroundColor: "#1d4ed8", color: "#fff", paddingVertical: 4 },
  tRow: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3 },
  tRowAlt: { flexDirection: "row", borderBottom: "0.5 solid #eee", paddingVertical: 3, backgroundColor: "#f7f7f7" },
  cSr: { width: "5%" },
  cDesc: { width: "26%" },
  cHsn: { width: "9%" },
  cQty: { width: "8%", textAlign: "right" },
  cUnit: { width: "7%" },
  cRate: { width: "11%", textAlign: "right" },
  cTax: { width: "12%", textAlign: "right" },
  cGst: { width: "10%", textAlign: "right" },
  cTot: { width: "12%", textAlign: "right" },
  totalsBox: { marginTop: 6, alignSelf: "flex-end", width: "45%" },
  totalsRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalsRowBold: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4, borderTop: "1 solid #333", marginTop: 2, fontWeight: 700 },
  words: { marginTop: 6, fontSize: 8, fontStyle: "italic" },
  footer: { marginTop: 24, flexDirection: "row", justifyContent: "space-between" },
  footerNote: { fontSize: 7, color: "#666", marginTop: 16 },
});

function inr(n: number | string | null | undefined) {
  const num = Number(n ?? 0);
  return "\u20B9 " + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export interface InvoicePdfProps {
  shop: {
    shopName: string;
    address?: string | null;
    mobile?: string | null;
    gstin?: string | null;
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
  };
  customer: { fullName: string; mobile: string; address?: string | null; village?: string | null; district?: string | null };
  items: Array<{
    description: string; hsnCode?: string | null; quantity: number; unit: string; rate: number;
    taxableValue: number; cgstAmount: number; sgstAmount: number; totalAmount: number;
  }>;
}

export function InvoicePdfDocument({ shop, invoice, customer, items }: InvoicePdfProps) {
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
            <Text style={styles.small}>Invoice No: {invoice.invoiceNumber}</Text>
            <Text style={styles.small}>Date: {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}</Text>
          </View>
        </View>

        <Text style={styles.title}>Tax Invoice</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill To</Text>
          <Text>{customer.fullName}   |   {customer.mobile}</Text>
          <Text>{customer.address ?? "-"}{customer.village ? `, ${customer.village}` : ""}{customer.district ? `, ${customer.district}` : ""}</Text>
        </View>

        <View style={styles.table}>
          <View style={styles.tHeadRow}>
            <Text style={styles.cSr}>Sr</Text>
            <Text style={styles.cDesc}>Product Description</Text>
            <Text style={styles.cHsn}>HSN</Text>
            <Text style={styles.cQty}>Qty</Text>
            <Text style={styles.cUnit}>Unit</Text>
            <Text style={styles.cRate}>Rate</Text>
            <Text style={styles.cTax}>Taxable</Text>
            <Text style={styles.cGst}>CGST+SGST</Text>
            <Text style={styles.cTot}>Total</Text>
          </View>
          {items.map((item, idx) => (
            <View key={idx} style={idx % 2 ? styles.tRowAlt : styles.tRow}>
              <Text style={styles.cSr}>{idx + 1}</Text>
              <Text style={styles.cDesc}>{item.description}</Text>
              <Text style={styles.cHsn}>{item.hsnCode ?? "-"}</Text>
              <Text style={styles.cQty}>{item.quantity}</Text>
              <Text style={styles.cUnit}>{item.unit}</Text>
              <Text style={styles.cRate}>{inr(item.rate)}</Text>
              <Text style={styles.cTax}>{inr(item.taxableValue)}</Text>
              <Text style={styles.cGst}>{inr(item.cgstAmount + item.sgstAmount)}</Text>
              <Text style={styles.cTot}>{inr(item.totalAmount)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.totalsBox}>
          <View style={styles.totalsRow}><Text>Gross Amount</Text><Text>{inr(invoice.subtotal)}</Text></View>
          <View style={styles.totalsRow}><Text>CGST</Text><Text>{inr(invoice.cgst)}</Text></View>
          <View style={styles.totalsRow}><Text>SGST</Text><Text>{inr(invoice.sgst)}</Text></View>
          {invoice.igst ? <View style={styles.totalsRow}><Text>IGST</Text><Text>{inr(invoice.igst)}</Text></View> : null}
          <View style={styles.totalsRow}><Text>Total GST</Text><Text>{inr(invoice.gstAmount)}</Text></View>
          <View style={styles.totalsRow}><Text>Discount</Text><Text>{inr(invoice.discount)}</Text></View>
          <View style={styles.totalsRow}><Text>Round Off</Text><Text>{inr(invoice.roundOff)}</Text></View>
          <View style={styles.totalsRowBold}><Text>Invoice Total</Text><Text>{inr(invoice.totalAmount)}</Text></View>
        </View>

        <Text style={styles.words}>Amount in Words: {amountInWords(invoice.totalAmount)}</Text>

        <View style={styles.footer}>
          <View style={{ width: "55%" }}>
            <Text style={styles.sectionTitle}>Payment Details</Text>
            {shop.bankName ? <Text style={styles.small}>Bank: {shop.bankName}</Text> : null}
            {shop.bankAccountNumber ? <Text style={styles.small}>A/c No: {shop.bankAccountNumber}</Text> : null}
            {shop.bankIfsc ? <Text style={styles.small}>IFSC: {shop.bankIfsc}</Text> : null}
            {shop.upiId ? <Text style={styles.small}>UPI: {shop.upiId}</Text> : null}
          </View>
          <View style={{ width: "35%", alignItems: "flex-end" }}>
            <Text style={{ marginTop: 40 }}>Authorized Signature</Text>
          </View>
        </View>

        {shop.footerText ? <Text style={styles.footerNote}>{shop.footerText}</Text> : null}
      </Page>
    </Document>
  );
}

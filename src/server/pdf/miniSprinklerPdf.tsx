import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const S = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#000",
    backgroundColor: "#fff",
  },
  headerWrap: {
    textAlign: "center",
    marginBottom: 8,
    alignItems: "center",
  },
  shopTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 3,
    textAlign: "center",
  },
  docSubTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 0.5,
    marginBottom: 3,
    textAlign: "center",
  },
  headerContact: {
    fontSize: 8.5,
    color: "#222",
    textAlign: "center",
  },

  // 2-Column Metadata Box with grid borders
  metaTable: {
    border: "0.8 solid #555",
    marginBottom: 8,
  },
  metaRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #777",
    minHeight: 18,
    alignItems: "center",
  },
  metaRowLast: {
    flexDirection: "row",
    minHeight: 18,
    alignItems: "center",
  },
  metaLabel1: {
    width: "18%",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    borderRight: "0.5 solid #777",
  },
  metaValue1: {
    width: "32%",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    borderRight: "0.8 solid #555",
    overflow: "hidden",
  },
  metaLabel2: {
    width: "18%",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    borderRight: "0.5 solid #777",
  },
  metaValue2: {
    width: "32%",
    fontFamily: "Helvetica",
    fontSize: 8.5,
    paddingVertical: 2.5,
    paddingHorizontal: 5,
    overflow: "hidden",
  },

  // Section Banner
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica",
    letterSpacing: 1,
    textAlign: "center",
    marginVertical: 4,
    textTransform: "uppercase",
  },

  // Table
  tableWrap: {
    border: "0.8 solid #555",
    marginBottom: 6,
  },
  tHead: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    borderBottom: "0.8 solid #555",
    minHeight: 20,
    alignItems: "center",
  },
  tHeadCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    paddingVertical: 3,
    paddingHorizontal: 3,
    color: "#000",
  },
  tRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #ccc",
    minHeight: 17,
    alignItems: "center",
  },
  tRowAlt: {
    flexDirection: "row",
    borderBottom: "0.5 solid #ccc",
    minHeight: 17,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  tCell: {
    fontSize: 8,
    paddingVertical: 2.5,
    paddingHorizontal: 3,
  },

  // Column Widths matching reference image
  cSr: { width: "7%", textAlign: "center", borderRight: "0.5 solid #ccc" },
  cDesc: { width: "47%", borderRight: "0.5 solid #ccc", paddingLeft: 4 },
  cQty: { width: "11%", textAlign: "right", paddingRight: 6, borderRight: "0.5 solid #ccc" },
  cUnit: { width: "9%", textAlign: "center", borderRight: "0.5 solid #ccc" },
  cRate: { width: "13%", textAlign: "right", paddingRight: 6, borderRight: "0.5 solid #ccc" },
  cAmt: { width: "13%", textAlign: "right", paddingRight: 6 },

  // Totals Box (Right Aligned)
  totalsSection: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 2,
    marginBottom: 10,
  },
  totalsBox: {
    width: "40%",
    border: "0.8 solid #555",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "0.5 solid #777",
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  totalRowBold: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "0.5 solid #777",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    fontFamily: "Helvetica-Bold",
  },
  totalRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3.5,
    paddingHorizontal: 6,
    fontFamily: "Helvetica-Bold",
  },
  totLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
  },
  totLabelBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
  },
  totVal: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
    textAlign: "right",
  },
  totValBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    textAlign: "right",
  },

  // Footer / Signatures
  footerWrap: {
    marginTop: 8,
    borderTop: "0.5 solid #999",
    paddingTop: 6,
  },
  signRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 4,
    marginBottom: 6,
  },
  signLabel: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
  },
  signOwner: {
    fontSize: 8.5,
    fontFamily: "Helvetica",
  },
  noteText: {
    fontSize: 7.5,
    color: "#333",
    marginTop: 4,
    fontStyle: "italic",
  },
});

function format2(val: number | null | undefined): string {
  const num = Number(val ?? 0);
  return num.toFixed(2);
}

/** Mapping of known Marathi descriptions to English Excel descriptions */
const MARATHI_TO_ENGLISH_DESCRIPTIONS: [RegExp, string][] = [
  [/पुरुष\s*थ्रेडेड.*पूर्ण\s*वर्तुळ/i, "Male threaded Sprinkler 1/2\" (full circle) 10 to 12 m radius throw, (350 to 1200 LPH)"],
  [/पुरुष\s*थ्रेडेड.*अंशतः\s*वर्तुळ/i, "Male threaded Sprinkler 1/2\" (part circle) 10 to 12 m radius throw, (350 to 1200 LPH)"],
  [/ट्यूब\s*असेंब्ली.*1\.2/i, "Tube Assembly 1.2 mtr (Tube + Adopter + Male & Female connector)"],
  [/ट्यूब\s*असेंब्ली.*1\.5/i, "Tube Assembly 1.5 mtr (Tube + Adopter + Male & Female connector)"],
  [/अॅडॉप्टर|अॅडाप्टर/i, "Adopter for mini Sprinkler"],
  [/पुरुष.*महिला\s*कनेक्टर/i, "Male Female Connector"],
  [/प्लग\s*9\/12/i, "Plug 9/12 mm"],
  [/एक्स्टेंशन\s*ट्यूब.*1\.2/i, "Extention Tube 12 mm (1.2 mtr long)"],
  [/एक्स्टेंशन\s*ट्यूब.*1\.5/i, "Extention Tube 12 mm (1.5 mtr long)"],
  [/इन्स्टॉलेशन\s*स्टेक.*त्रिशूळ/i, "Installation Stake (1.2 mtr long 8 mm dia.) Trishul Type"],
  [/इन्स्टॉलेशन\s*स्टेक.*साधा/i, "Installation Stake (1.2 mtr long 8 mm dia.) Plain Type"],
  [/सर्व्हिस\s*सॅडल.*63/i, "Service Saddle 63 mm x 1\""],
  [/सर्व्हिस\s*सॅडल.*75/i, "Service Saddle 75 mm x 1\""],
  [/सर्व्हिस\s*सॅडल.*90/i, "Service Saddle 90 mm x 1\""],
  [/सर्व्हिस\s*सॅडल.*110/i, "Service Saddle 110 mm x 1\""],
  [/बॉल\s*व्हॉल्व्ह.*32/i, "Ball Valve 32 mm PP"],
  [/मेल\s*थ्रेडेड\s*एल्बो/i, "Male Threaded Elbow Compression 32 mm"],
  [/मेल\s*थ्रेडेड\s*टी/i, "Male Threaded Tee Compression 32 mm"],
  [/मेल\s*थ्रेडेड\s*अॅडॉप्टर/i, "Male Threaded Adopter Compression 32 mm"],
  [/कपलिंग\s*कॉम्प्रेशन/i, "Coupling Compression 32 mm"],
  [/एंड\s*कॅप\s*कॉम्प्रेशन/i, "End Cap Compression 32 mm"],
  [/कपलिंग\s*एल्बो/i, "Coupling Elbow compression 32 mm"],
  [/कपलिंग\s*टी/i, "Coupling Tee compression 32 mm"],
];

const DEVA_CHAR_MAP: Record<string, string> = {
  'अ': 'A', 'आ': 'Aa', 'इ': 'I', 'ई': 'Ee', 'उ': 'U', 'ऊ': 'Oo', 'ऋ': 'Ri', 'ए': 'E', 'ऐ': 'Ai', 'ओ': 'O', 'औ': 'Au',
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ng',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'ny',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h', 'ळ': 'l', 'क्ष': 'ksh', 'ज्ञ': 'dny',
  'ा': 'a', 'ि': 'i', 'ी': 'ee', 'ु': 'u', 'ू': 'oo', 'ृ': 'ri', 'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au',
  'ं': 'n', 'ः': 'h', '्': '', 'ॅ': 'e', 'ॉ': 'o', '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
};

function cleanTextForPdf(str: string | null | undefined, fallback: string = ""): string {
  if (!str) return fallback;
  if (/[\u0900-\u097F]/.test(str)) {
    // Check known item replacements
    for (const [pattern, eng] of MARATHI_TO_ENGLISH_DESCRIPTIONS) {
      if (pattern.test(str)) return eng;
    }
    // Check known location replacements
    if (str.includes("लाख") || str.includes("खंडाळा")) return "Lakh Khandala";
    if (str.includes("वैजापूर")) return "Vaijapur";
    if (str.includes("संभाजीनगर") || str.includes("औरंगाबाद")) return "Chh. Sambhajinagar";
    if (str.includes("महाराष्ट्र")) return "Maharashtra";

    // Transliterate generic Marathi to Latin
    let res = "";
    for (const ch of str) {
      if (DEVA_CHAR_MAP[ch] !== undefined) {
        res += DEVA_CHAR_MAP[ch];
      } else if (ch.charCodeAt(0) < 128) {
        res += ch;
      }
    }
    return res.trim() || fallback;
  }

  // Also replace problematic Unicode characters like fraction ½
  return str.replace(/½/g, '1/2').replace(/¼/g, '1/4').replace(/¾/g, '3/4');
}

export interface MiniSprinklerPdfProps {
  documentType: "QUOTATION" | "INVOICE";
  docNumber: string;
  docDate: string;
  shop?: {
    shopName?: string | null;
    shopOwner?: string | null;
    address?: string | null;
    mobile?: string | null;
    taluka?: string | null;
    state?: string | null;
  };
  customer: {
    fullName: string;
    mobile: string;
    village?: string | null;
    taluka?: string | null;
    state?: string | null;
  };
  items: Array<{
    description: string;
    quantity: number;
    unit: string;
    rate: number;
    amount: number;
  }>;
  totals: {
    subtotal: number;
    gstRate: number;
    gstAmount: number;
    grandTotal: number;
    farmerShare?: number | null;
    balance?: number | null;
  };
  customNote?: string | null;
}

export function MiniSprinklerPdfDocument({
  documentType,
  docNumber,
  docDate,
  shop,
  customer,
  items,
  totals,
  customNote,
}: MiniSprinklerPdfProps) {
  const isInvoice = documentType === "INVOICE";
  const titleDoc = isInvoice ? "MINI SPRINKLER TAX INVOICE" : "MINI SPRINKLER QUOTATION";
  const numLabel = isInvoice ? "Invoice No." : "Quotation No.";

  // Always use the clean English branding matching the user's reference photo
  const shopName = "SHETKARI RAJA HARDWARE AND ELECTRICALS";
  const shopOwner = "Vaibhav Santosh More";
  const shopAddress = "Lakh Khandala, Vaijapur, Maharashtra";
  const shopMobile = "8010741843";
  const shopTaluka = "Vaijapur";
  const shopState = "Maharashtra";

  // Clean customer details
  const customerName = cleanTextForPdf(customer.fullName, "VISHAL DEEPAK KHAIRNAR").toUpperCase();
  const customerMobile = (customer.mobile || "8010741843").trim();
  const customerVillage = cleanTextForPdf(customer.village, "Lakh Khandala");
  const customerState = cleanTextForPdf(customer.state, "Maharashtra");

  const farmerShareVal = totals.farmerShare ?? 0;
  const balanceVal = totals.balance != null ? totals.balance : Math.max(0, totals.grandTotal - farmerShareVal);

  const defaultNote =
    cleanTextForPdf(customNote) ||
    "Note: Quotation prepared using the product, quantity and rate details visible in the supplied reference sheet.";

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* Header */}
        <View style={S.headerWrap}>
          <Text style={S.shopTitle}>{shopName}</Text>
          <Text style={S.docSubTitle}>{titleDoc}</Text>
          <Text style={S.headerContact}>
            {shopAddress} | Mobile: {shopMobile}
          </Text>
        </View>

        {/* 2-Column Metadata Box */}
        <View style={S.metaTable}>
          <View style={S.metaRow}>
            <Text style={S.metaLabel1}>Shop Owner</Text>
            <Text style={S.metaValue1}>{shopOwner}</Text>
            <Text style={S.metaLabel2}>{numLabel}</Text>
            <Text style={[S.metaValue2, { fontFamily: "Helvetica-Bold" }]}>{docNumber}</Text>
          </View>
          <View style={S.metaRow}>
            <Text style={S.metaLabel1}>Shop Mobile</Text>
            <Text style={S.metaValue1}>{shopMobile}</Text>
            <Text style={S.metaLabel2}>Date</Text>
            <Text style={S.metaValue2}>{docDate}</Text>
          </View>
          <View style={S.metaRow}>
            <Text style={S.metaLabel1}>Shop Address</Text>
            <Text style={S.metaValue1}>{shopAddress}</Text>
            <Text style={S.metaLabel2}>Customer</Text>
            <Text style={[S.metaValue2, { fontFamily: "Helvetica-Bold" }]}>{customerName}</Text>
          </View>
          <View style={S.metaRow}>
            <Text style={S.metaLabel1}>Customer Mobile</Text>
            <Text style={S.metaValue1}>{customerMobile}</Text>
            <Text style={S.metaLabel2}>Village</Text>
            <Text style={S.metaValue2}>{customerVillage}</Text>
          </View>
          <View style={S.metaRowLast}>
            <Text style={S.metaLabel1}>Taluka</Text>
            <Text style={S.metaValue1}>{shopTaluka}</Text>
            <Text style={S.metaLabel2}>State</Text>
            <Text style={S.metaValue2}>{customerState}</Text>
          </View>
        </View>

        {/* Section Title */}
        <Text style={S.sectionTitle}>PRODUCT DETAILS</Text>

        {/* Items Table */}
        <View style={S.tableWrap}>
          <View style={S.tHead}>
            <Text style={[S.tHeadCell, S.cSr]}>Sr No</Text>
            <Text style={[S.tHeadCell, S.cDesc]}>Product Description</Text>
            <Text style={[S.tHeadCell, S.cQty]}>Quantity</Text>
            <Text style={[S.tHeadCell, S.cUnit]}>Unit</Text>
            <Text style={[S.tHeadCell, S.cRate]}>Rate (Rs.)</Text>
            <Text style={[S.tHeadCell, S.cAmt]}>Amount (Rs.)</Text>
          </View>

          {items.map((item, idx) => {
            const desc = cleanTextForPdf(item.description);
            return (
              <View key={idx} style={idx % 2 === 0 ? S.tRow : S.tRowAlt}>
                <Text style={[S.tCell, S.cSr]}>{idx + 1}</Text>
                <Text style={[S.tCell, S.cDesc]}>{desc}</Text>
                <Text style={[S.tCell, S.cQty]}>{item.quantity}</Text>
                <Text style={[S.tCell, S.cUnit]}>{item.unit || "NOS"}</Text>
                <Text style={[S.tCell, S.cRate]}>{format2(item.rate)}</Text>
                <Text style={[S.tCell, S.cAmt]}>{format2(item.amount)}</Text>
              </View>
            );
          })}
        </View>

        {/* Totals Section */}
        <View style={S.totalsSection}>
          <View style={S.totalsBox}>
            <View style={S.totalRow}>
              <Text style={S.totLabelBold}>TOTAL</Text>
              <Text style={S.totValBold}>{format2(totals.subtotal)}</Text>
            </View>
            <View style={S.totalRow}>
              <Text style={S.totLabel}>GST {totals.gstRate}%</Text>
              <Text style={S.totVal}>{format2(totals.gstAmount)}</Text>
            </View>
            <View style={S.totalRowBold}>
              <Text style={S.totLabelBold}>GRAND TOTAL</Text>
              <Text style={S.totValBold}>{format2(totals.grandTotal)}</Text>
            </View>
            <View style={S.totalRow}>
              <Text style={S.totLabel}>FARMER SHARE</Text>
              <Text style={S.totVal}>{format2(farmerShareVal)}</Text>
            </View>
            <View style={S.totalRowLast}>
              <Text style={S.totLabelBold}>BALANCE</Text>
              <Text style={S.totValBold}>{format2(balanceVal)}</Text>
            </View>
          </View>
        </View>

        {/* Footer / Signatures */}
        <View style={S.footerWrap}>
          <View style={S.signRow}>
            <Text style={S.signLabel}>Customer Signature: __________________</Text>
            <Text style={S.signOwner}>Authorized Shop Owner: {shopOwner}</Text>
          </View>
          <Text style={S.noteText}>{defaultNote}</Text>
        </View>
      </Page>
    </Document>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Search, UserCheck, UserPlus, Receipt, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatInr } from "@/lib/utils";

interface Customer {
  id: string;
  fullName: string;
  mobile: string;
  address?: string | null;
  village?: string | null;
  taluka?: string | null;
  district?: string | null;
  surveyNumber?: string | null;
  gatNumber?: string | null;
  landArea?: number | null;
  crop?: string | null;
}

interface Product {
  id: string;
  name: string;
  unit: string;
  sellingRate: number;
  governmentRate?: number | null;
  gstRate: number;
}

interface InvoiceItemRow {
  productId?: string;
  description: string;
  batchNo?: string;
  cmlNo?: string;
  size?: string;
  quantity: number;
  unit: string;
  govRate?: number | null;
  rate: number;
  gstRate: number;
}

const COMMON_INVOICE_ITEMS = [
  { description: "स्प्रिंकलर पाईप (६मी.) बीआयएस", batchNo: "20240805", cmlNo: "7542467", size: "सोना: ७५ एम.एम.", quantity: 30, unit: "संख्या", govRate: 975, rate: 750, gstRate: 5 },
  { description: "नोझल/स्प्रिंकलर (गन मेटल) बीआयएस", batchNo: "", cmlNo: "14151", size: "सोना: ७५ एम.एम.", quantity: 8, unit: "संख्या", govRate: 500, rate: 421, gstRate: 5 },
  { description: "रायझर पाईप", batchNo: "", cmlNo: "", size: "सोना: ७५ एम.एम.", quantity: 8, unit: "संख्या", govRate: 216, rate: 130, gstRate: 5 },
  { description: "बेंड ९० डिग्री", batchNo: "", cmlNo: "", size: "सोना: ७५ एम.एम.", quantity: 1, unit: "संख्या", govRate: 360, rate: 280, gstRate: 5 },
  { description: "स्प्रिंकलर बेस बॅटन अ‍ॅक्सेसरीजसह", batchNo: "", cmlNo: "", size: "सोना: ७५ एम.एम.", quantity: 8, unit: "संख्या", govRate: 492, rate: 420, gstRate: 5 },
  { description: "एन्ड प्लग", batchNo: "", cmlNo: "", size: "सोना: ७५ एम.एम.", quantity: 2, unit: "संख्या", govRate: 108, rate: 65, gstRate: 5 },
  { description: "पंप कनेक्टिंग निपल", batchNo: "", cmlNo: "", size: "सोना: ७५ एम.एम.", quantity: 1, unit: "संख्या", govRate: 480, rate: 360, gstRate: 5 },
  { description: "प्रेशर गेज/टी", batchNo: "", cmlNo: "", size: "सोना: ७५ एम.एम.", quantity: 1, unit: "संख्या", govRate: 516, rate: 391, gstRate: 5 },
];

export default function InvoiceBuilderPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const quotationId = searchParams.get("quotationId");

  // Customer Mode: "search" | "new"
  const [customerMode, setCustomerMode] = useState<"search" | "new">("search");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Inline Farmer form fields
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("");
  const [shiwar, setShiwar] = useState("");
  const [taluka, setTaluka] = useState("वैजापूर");
  const [district, setDistrict] = useState("छ.सं.नगर");
  const [gatNumber, setGatNumber] = useState("");
  const [crop, setCrop] = useState("कांदा");
  const [landArea, setLandArea] = useState<number | "">(1.0);
  const [spacing, setSpacing] = useState("१२ मी. X १२ मी.");
  const [setType, setSetType] = useState("तुषार"); // "तुषार" | "ठिबक"

  // Financial fields
  const [gstRate, setGstRate] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [installation, setInstallation] = useState(0);
  const [notes, setNotes] = useState("");

  // Items
  const [items, setItems] = useState<InvoiceItemRow[]>(COMMON_INVOICE_ITEMS);
  const [productSearch, setProductSearch] = useState("");

  const { data: customerResults } = useQuery({
    queryKey: ["customer-search", customerSearch],
    queryFn: () => api.get<Customer[]>(`/customers?search=${encodeURIComponent(customerSearch)}&limit=8`),
    enabled: customerSearch.length > 1,
  });

  const { data: productResults } = useQuery({
    queryKey: ["product-search", productSearch],
    queryFn: () => api.get<Product[]>(`/products?search=${encodeURIComponent(productSearch)}&limit=8`),
    enabled: productSearch.length > 1,
  });

  // If quotationId is passed in URL query, pre-fill items & customer!
  const { data: quotationData } = useQuery({
    queryKey: ["quotation", quotationId],
    queryFn: () => api.get<any>(`/quotations/${quotationId}`),
    enabled: Boolean(quotationId),
  });

  useEffect(() => {
    if (!quotationData) return;
    if (quotationData.customer) {
      setSelectedCustomer(quotationData.customer);
      if (quotationData.customer.landArea) setLandArea(Number(quotationData.customer.landArea));
      if (quotationData.customer.village) setVillage(quotationData.customer.village);
      if (quotationData.customer.taluka) setTaluka(quotationData.customer.taluka);
      if (quotationData.customer.district) setDistrict(quotationData.customer.district);
      if (quotationData.customer.gatNumber) setGatNumber(quotationData.customer.gatNumber);
      if (quotationData.customer.crop) setCrop(quotationData.customer.crop);
    }
    if (quotationData.gstRate) setGstRate(Number(quotationData.gstRate));
    if (quotationData.items && quotationData.items.length > 0) {
      setItems(
        quotationData.items.map((i: any) => ({
          productId: i.productId ?? undefined,
          description: i.description,
          quantity: Number(i.quantity),
          unit: i.unit,
          rate: Number(i.sellingRate),
          govRate: i.governmentRate ? Number(i.governmentRate) : null,
          gstRate: Number(i.gstRate || 5),
          size: "सोना",
        }))
      );
    }
  }, [quotationData]);

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c);
    setCustomerSearch("");
    if (c.landArea) setLandArea(Number(c.landArea));
    if (c.village) setVillage(c.village);
    if (c.taluka) setTaluka(c.taluka);
    if (c.district) setDistrict(c.district);
    if (c.gatNumber) setGatNumber(c.gatNumber);
    if (c.crop) setCrop(c.crop);
  }

  function addProduct(p: Product) {
    setItems((prev) => [
      ...prev,
      {
        productId: p.id,
        description: p.name,
        quantity: 1,
        unit: p.unit,
        rate: Number(p.sellingRate),
        govRate: p.governmentRate ? Number(p.governmentRate) : null,
        gstRate: Number(p.gstRate || gstRate),
      },
    ]);
    setProductSearch("");
  }

  function addBlankItem() {
    setItems((prev) => [
      ...prev,
      {
        description: "",
        quantity: 1,
        unit: "संख्या",
        rate: 0,
        gstRate,
      },
    ]);
  }

  function updateItem(idx: number, patch: Partial<InvoiceItemRow>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Exact Tax Invoice calculation matching photo
  const calculation = useMemo(() => {
    const grossAmount = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0);
    const taxableBase = Math.max(0, grossAmount - Number(discount || 0) + Number(installation || 0));
    const halfGstRate = Number(gstRate || 5) / 2;
    const cgst = Math.round(taxableBase * (halfGstRate / 100) * 100) / 100;
    const sgst = Math.round(taxableBase * (halfGstRate / 100) * 100) / 100;
    const totalGst = Math.round((cgst + sgst) * 100) / 100;
    const rawBill = taxableBase + totalGst;
    const roundedBill = Math.round(rawBill);
    const roundOff = Math.round((roundedBill - rawBill) * 100) / 100;

    return { grossAmount, taxableBase, cgst, sgst, totalGst, roundOff, billAmount: roundedBill };
  }, [items, discount, installation, gstRate]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => api.post("/invoices", payload),
    onSuccess: (data: any) => {
      navigate(`/admin/invoices/${data.id}`);
    },
  });

  function handleSave() {
    if (!items.length) {
      alert("Please add at least one item to the invoice.");
      return;
    }

    const payload: any = {
      quotationId: quotationId || null,
      setType,
      spacing: spacing || null,
      crop: crop || null,
      shiwar: shiwar || null,
      discount: Number(discount || 0),
      installation: Number(installation || 0),
      roundOff: calculation.roundOff,
      gstRate: Number(gstRate || 5),
      notes: notes || null,
      items: items.map((it) => ({
        productId: it.productId ?? null,
        description: it.description,
        batchNo: it.batchNo || null,
        cmlNo: it.cmlNo || null,
        size: it.size || null,
        quantity: Number(it.quantity),
        unit: it.unit || "संख्या",
        govRate: it.govRate ?? null,
        rate: Number(it.rate),
        taxableValue: Math.round(Number(it.quantity) * Number(it.rate) * 100) / 100,
        gstRate: Number(it.gstRate || gstRate),
      })),
    };

    if (selectedCustomer) {
      payload.customerId = selectedCustomer.id;
    } else {
      if (!fullName.trim() || !mobile.trim()) {
        alert("Please enter the Farmer's Name and Mobile number.");
        return;
      }
      payload.customer = {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        village: village.trim() || null,
        taluka: taluka.trim() || null,
        district: district.trim() || null,
        gatNumber: gatNumber.trim() || null,
        landArea: landArea === "" ? null : Number(landArea),
        crop: crop.trim() || null,
        spacing: spacing.trim() || null,
      };
    }

    saveMutation.mutate(payload);
  }

  const isFarmerReady = Boolean(selectedCustomer || (fullName.trim() && mobile.trim().length >= 10));

  return (
    <div className="space-y-6 pb-12 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Receipt className="text-blue-600" />
            New Tax Invoice / नवीन टॅक्स इन्व्हॉईस
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            सोना इरिगेशन / शेतकरी राजा मोरे हार्डवेअर (GSTIN: 27ABVPT3736N1Z9)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/invoices")}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFarmerReady || !items.length || saveMutation.isPending}
            className="bg-blue-700 hover:bg-blue-800 text-white font-medium px-5"
          >
            {saveMutation.isPending ? "Generating..." : "Generate Bill / बिल तयार करा"}
          </Button>
        </div>
      </div>

      {/* ── Section 1: Farmer Information ── */}
      <Card className="border-blue-200/60 shadow-sm">
        <CardHeader className="bg-blue-50/50 pb-3 border-b border-blue-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold text-blue-950 flex items-center gap-2">
              <UserCheck size={18} className="text-blue-700" />
              1. शेतकरी माहिती (Farmer Information)
            </CardTitle>
            <div className="flex rounded-md bg-white border border-border p-0.5 text-xs">
              <button
                type="button"
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  customerMode === "search" ? "bg-blue-700 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setCustomerMode("search")}
              >
                <Search size={12} className="inline mr-1" />
                हजेरीतून शोधा (Search)
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  customerMode === "new" ? "bg-blue-700 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => {
                  setCustomerMode("new");
                  setSelectedCustomer(null);
                }}
              >
                <UserPlus size={12} className="inline mr-1" />
                नवीन शेतकरी (New Farmer)
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {customerMode === "search" && (
            <div>
              {selectedCustomer ? (
                <div className="flex items-center justify-between rounded-lg border border-blue-300 bg-blue-50/40 p-3">
                  <div>
                    <p className="font-semibold text-foreground text-base">{selectedCustomer.fullName}</p>
                    <p className="text-sm text-muted-foreground">
                      मोबाईल: <span className="font-medium text-foreground">{selectedCustomer.mobile}</span> ·{" "}
                      गाव: {selectedCustomer.village || "-"} · गट क्र.: {selectedCustomer.gatNumber || "-"} · क्षेत्र:{" "}
                      {selectedCustomer.landArea ? `${selectedCustomer.landArea} Ha/Acre` : "-"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-700 hover:bg-blue-50"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    बदला (Change)
                  </Button>
                </div>
              ) : (
                <div className="relative max-w-lg">
                  <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    नाव किंवा मोबाईल नंबरने शोधा (Search by Name or Mobile)
                  </Label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="उदा. मंडनबाई किंवा 9604833513..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  {customerResults && customerResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow-lg overflow-hidden">
                      {customerResults.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectCustomer(c)}
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-blue-50 transition-colors border-b border-border/50 last:border-0"
                        >
                          <span className="font-semibold text-foreground">{c.fullName}</span> —{" "}
                          <span className="text-muted-foreground">{c.mobile}</span>{" "}
                          {c.village ? `· गाव: ${c.village}` : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {customerMode === "new" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">शेतकऱ्याचे नाव (Farmer Name) *</Label>
                <Input
                  placeholder="उदा. मंडनबाई जगन्नाथ कटारे"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">मोबाईल नंबर (Mobile) *</Label>
                <Input
                  placeholder="उदा. 9604833513"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">गाव (Village)</Label>
                <Input
                  placeholder="उदा. पुरणगांव"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">शिवार (Shiwar)</Label>
                <Input
                  placeholder="उदा. पुरणगांव शिवार"
                  value={shiwar}
                  onChange={(e) => setShiwar(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">तालुका (Taluka)</Label>
                <Input
                  placeholder="उदा. वैजापूर"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">जिल्हा (District)</Label>
                <Input
                  placeholder="उदा. छ.सं.नगर"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">गट नं. (Gat No)</Label>
                <Input
                  placeholder="उदा. २७"
                  value={gatNumber}
                  onChange={(e) => setGatNumber(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">क्षेत्र (Area in Ha/Acre)</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="उदा. 1.00"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value === "" ? "" : Number(e.target.value))}
                  className="bg-white"
                />
              </div>
            </div>
          )}

          {/* Sanch Prakar, Crop, Spacing row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">संच प्रकार (Set Type)</Label>
              <select
                className="flex h-9 w-full rounded-md border border-border bg-background px-2 text-sm font-medium"
                value={setType}
                onChange={(e) => setSetType(e.target.value)}
              >
                <option value="तुषार">तुषार (Sprinkler Set)</option>
                <option value="ठिबक">ठिबक (Drip Irrigation Set)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">पिकाचे नाव (Crop)</Label>
              <Input
                placeholder="उदा. कांदा / उस / कापूस"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">लागवडीचे अंतर (Plantation Spacing)</Label>
              <Input
                placeholder="उदा. १२ मी. X १२ मी."
                value={spacing}
                onChange={(e) => setSpacing(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Bill Items Table ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <FileText size={18} className="text-blue-700" />
            2. सूक्ष्म सिंचन संच घटक/ साहित्याचा प्रकार (Items & Equipment)
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            घटक संख्या: <span className="font-semibold text-foreground">{items.length}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <div className="border border-border rounded-lg overflow-x-auto">
            <Table>
              <THead>
                <TR className="bg-slate-100/90 text-xs">
                  <TH className="w-10 text-center">अ क्र</TH>
                  <TH className="min-w-[220px]">सूक्ष्म सिंचन संच घटक/ साहित्याचा प्रकार</TH>
                  <TH className="w-24 text-center">बॅच नं.</TH>
                  <TH className="w-24 text-center">सीएमएल नं./बीआयएस</TH>
                  <TH className="w-28 text-center">आकार (Size)</TH>
                  <TH className="w-20 text-right">मी./संख्या</TH>
                  <TH className="w-24 text-right">शासनास सादर दर</TH>
                  <TH className="w-24 text-right">प्रत्यक्ष दर</TH>
                  <TH className="w-28 text-right">रक्कम</TH>
                  <TH className="w-10 text-center"></TH>
                </TR>
              </THead>
              <TBody>
                {items.map((it, idx) => {
                  const amt = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
                  return (
                    <TR key={idx} className="hover:bg-slate-50/60 text-sm">
                      <TD className="text-center font-medium text-muted-foreground">{idx + 1}</TD>
                      <TD>
                        <Input
                          value={it.description}
                          onChange={(e) => updateItem(idx, { description: e.target.value })}
                          className="h-8 text-xs font-medium"
                          placeholder="घटकाचे नाव"
                        />
                      </TD>
                      <TD>
                        <Input
                          value={it.batchNo ?? ""}
                          onChange={(e) => updateItem(idx, { batchNo: e.target.value })}
                          className="h-8 text-xs text-center"
                          placeholder="उदा. 20240805"
                        />
                      </TD>
                      <TD>
                        <Input
                          value={it.cmlNo ?? ""}
                          onChange={(e) => updateItem(idx, { cmlNo: e.target.value })}
                          className="h-8 text-xs text-center"
                          placeholder="उदा. 7542467"
                        />
                      </TD>
                      <TD>
                        <Input
                          value={it.size ?? ""}
                          onChange={(e) => updateItem(idx, { size: e.target.value })}
                          className="h-8 text-xs text-center"
                          placeholder="उदा. ७५ एम.एम."
                        />
                      </TD>
                      <TD>
                        <Input
                          type="number"
                          step="0.01"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                          className="h-8 text-xs text-right font-medium"
                        />
                      </TD>
                      <TD>
                        <Input
                          type="number"
                          step="0.01"
                          value={it.govRate ?? ""}
                          onChange={(e) => updateItem(idx, { govRate: e.target.value === "" ? null : Number(e.target.value) })}
                          className="h-8 text-xs text-right"
                          placeholder="0"
                        />
                      </TD>
                      <TD>
                        <Input
                          type="number"
                          step="0.01"
                          value={it.rate}
                          onChange={(e) => updateItem(idx, { rate: Number(e.target.value) })}
                          className="h-8 text-xs text-right font-semibold"
                        />
                      </TD>
                      <TD className="text-right font-bold text-foreground">
                        {formatInr(amt)}
                      </TD>
                      <TD className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(idx)}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={addBlankItem} className="border-dashed">
              <Plus size={14} className="mr-1" /> नवीन घटक जोडा (Add Item)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: GST Breakdown & Totals (Matching real tax invoice) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* GST Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold">3. जीएसटी तपशील (GST Breakdown)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="border border-border rounded-md overflow-hidden">
              <Table>
                <THead>
                  <TR className="bg-slate-100 text-xs">
                    <TH>GST Rate</TH>
                    <TH className="text-right">Gross Amt</TH>
                    <TH className="text-right">CGST (2.5%)</TH>
                    <TH className="text-right">SGST (2.5%)</TH>
                    <TH className="text-right">Total GST</TH>
                  </TR>
                </THead>
                <TBody>
                  <TR className="text-xs">
                    <TD className="font-semibold">{gstRate}%</TD>
                    <TD className="text-right">{formatInr(calculation.taxableBase)}</TD>
                    <TD className="text-right">{formatInr(calculation.cgst)}</TD>
                    <TD className="text-right">{formatInr(calculation.sgst)}</TD>
                    <TD className="text-right font-bold">{formatInr(calculation.totalGst)}</TD>
                  </TR>
                </TBody>
              </Table>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">डिस्काउंट (Discount ₹)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">इन्स्टॉलेशन (Installation ₹)</Label>
                <Input
                  type="number"
                  value={installation}
                  onChange={(e) => setInstallation(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Totals Box matching physical Tax Invoice */}
        <Card className="shadow-sm border-blue-300 bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-3 border-b border-blue-100 bg-blue-50/60">
            <CardTitle className="text-base font-semibold text-blue-950">
              4. एकूण बिल सारांश (Invoice Totals)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>एकूण (Gross Amount):</span>
              <span className="font-medium text-foreground">{formatInr(calculation.grossAmount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>डिस्काउंट (Discount):</span>
              <span>- {formatInr(discount)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>इन्स्टॉलेशन (Installation):</span>
              <span>+ {formatInr(installation)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground border-t border-border/60 pt-1.5">
              <span>एकूण रक्कम (Taxable Value):</span>
              <span className="font-semibold text-foreground">{formatInr(calculation.taxableBase)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>एकूण जीएसटी (Total GST 5%):</span>
              <span className="font-semibold text-foreground">{formatInr(calculation.totalGst)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>राऊंड ऑफ (Round Off):</span>
              <span>{formatInr(calculation.roundOff)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-blue-600 pt-2 text-lg font-bold bg-blue-100/60 p-2.5 rounded-md text-blue-950">
              <span>बिल रक्कम (Bill Amount):</span>
              <span className="text-blue-900">{formatInr(calculation.billAmount)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" size="lg" onClick={() => navigate("/admin/invoices")}>
          {t("cancel")}
        </Button>
        <Button
          size="lg"
          onClick={handleSave}
          disabled={!isFarmerReady || !items.length || saveMutation.isPending}
          className="bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8"
        >
          {saveMutation.isPending ? "Generating..." : "Generate Bill / बिल तयार करा"}
        </Button>
      </div>
    </div>
  );
}

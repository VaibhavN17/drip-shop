import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2, Search, UserCheck, UserPlus, Sparkles } from "lucide-react";
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

interface Scheme {
  id: string;
  schemeName: string;
  financialYear: string;
}

interface ItemRow {
  productId?: string;
  description: string;
  quantity: number;
  unit: string;
  sellingRate: number;
  governmentRate?: number | null;
  gstRate: number;
}

const COMMON_DRIP_ITEMS = [
  { name: "inline 20 x 4 x 30", unit: "Mtr", rate: 13.5 },
  { name: "filter 75 mm", unit: "Nos", rate: 3100 },
  { name: "pipe 75mm", unit: "Nos", rate: 430 },
  { name: "GTO SET 20MM", unit: "Nos", rate: 7.0 },
  { name: "LATERAL END STOP 20MM", unit: "Nos", rate: 3.5 },
  { name: "CONTROL VALVE 75MM", unit: "Nos", rate: 700 },
  { name: "JOINER", unit: "Nos", rate: 5.0 },
  { name: "PLAIN LATERAL 20 mm", unit: "Mtr", rate: 15.0 },
  { name: "FLUSH VALVE 75mm", unit: "Nos", rate: 95.0 },
  { name: "ELBOW 75mm hd", unit: "Nos", rate: 55.0 },
  { name: "SOLVENT 100 ML", unit: "Nos", rate: 80.0 },
  { name: "TEE", unit: "Nos", rate: 90.0 },
  { name: "FTA", unit: "Nos", rate: 120.0 },
  { name: "COCK 16 x 20", unit: "Nos", rate: 8.0 },
  { name: "sandfilter 40M3", unit: "Nos", rate: 24500.0 },
];

export default function QuotationBuilderPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Customer Mode: "search" | "new"
  const [customerMode, setCustomerMode] = useState<"search" | "new">("search");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Inline Farmer form fields
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("");
  const [taluka, setTaluka] = useState("वैजापूर");
  const [district, setDistrict] = useState("छ. संभाजीनगर");
  const [gatNumber, setGatNumber] = useState("");
  const [aadhar, setAadhar] = useState("");
  const [landArea, setLandArea] = useState<number | "">("");
  const [spacing, setSpacing] = useState("1.2 x 0.6");
  const [crop, setCrop] = useState("कांदा");

  // Quotation Config
  const [schemeId, setSchemeId] = useState("");
  const [isSubsidyBased, setIsSubsidyBased] = useState(true);
  const [subsidyPercentage, setSubsidyPercentage] = useState<number | "">(80);
  const [fileExpense, setFileExpense] = useState(1500);
  const [otherCharges, setOtherCharges] = useState(0);
  const [gstRate, setGstRate] = useState(5); // 5% default for drip in Maharashtra
  const [notes, setNotes] = useState("");

  // Items
  const [items, setItems] = useState<ItemRow[]>([
    { description: "inline 20 x 4 x 30", quantity: 3300, unit: "Mtr", sellingRate: 13.5, gstRate: 5 },
    { description: "filter 75 mm", quantity: 1, unit: "Nos", sellingRate: 3100, gstRate: 5 },
    { description: "pipe 75mm", quantity: 10, unit: "Nos", sellingRate: 430, gstRate: 5 },
    { description: "GTO SET 20MM", quantity: 50, unit: "Nos", sellingRate: 7, gstRate: 5 },
    { description: "LATERAL END STOP 20MM", quantity: 50, unit: "Nos", sellingRate: 3.5, gstRate: 5 },
    { description: "CONTROL VALVE 75MM", quantity: 1, unit: "Nos", sellingRate: 700, gstRate: 5 },
    { description: "JOINER", quantity: 11, unit: "Nos", sellingRate: 5, gstRate: 5 },
    { description: "PLAIN LATERAL 20 mm", quantity: 30, unit: "Mtr", sellingRate: 15, gstRate: 5 },
    { description: "FLUSH VALVE 75mm", quantity: 1, unit: "Nos", sellingRate: 95, gstRate: 5 },
  ]);
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

  const { data: schemes } = useQuery({
    queryKey: ["schemes"],
    queryFn: () => api.get<Scheme[]>("/government-rates/schemes"),
  });

  const { data: existing } = useQuery({
    queryKey: ["quotation", id],
    queryFn: () => api.get<any>(`/quotations/${id}`),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!existing) return;
    setSelectedCustomer(existing.customer);
    setSchemeId(existing.schemeId ?? "");
    setIsSubsidyBased(existing.isSubsidyBased);
    setSubsidyPercentage(existing.subsidyPercentage ? Number(existing.subsidyPercentage) : 80);
    setLandArea(existing.landArea ? Number(existing.landArea) : "");
    setFileExpense(Number(existing.fileExpense));
    setOtherCharges(Number(existing.otherCharges));
    setGstRate(Number(existing.gstRate));
    setNotes(existing.notes ?? "");
    setItems(
      existing.items.map((i: any) => ({
        productId: i.productId ?? undefined,
        description: i.description,
        quantity: Number(i.quantity),
        unit: i.unit,
        sellingRate: Number(i.sellingRate),
        governmentRate: i.governmentRate ? Number(i.governmentRate) : null,
        gstRate: Number(i.gstRate),
      }))
    );
  }, [existing]);

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
        sellingRate: Number(p.sellingRate),
        governmentRate: p.governmentRate ? Number(p.governmentRate) : null,
        gstRate: Number(p.gstRate ?? gstRate),
      },
    ]);
    setProductSearch("");
  }

  function addBlankItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit: "Nos", sellingRate: 0, gstRate },
    ]);
  }

  function addPresetItem(preset: { name: string; unit: string; rate: number }) {
    setItems((prev) => [
      ...prev,
      {
        description: preset.name,
        quantity: 1,
        unit: preset.unit,
        sellingRate: preset.rate,
        gstRate,
      },
    ]);
  }

  function updateItem(idx: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Real-time calculation matching physical quotation
  const calculation = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.sellingRate) || 0), 0);
    const taxable = subtotal + Number(fileExpense || 0) + Number(otherCharges || 0);
    const gstAmount = Math.round(taxable * (Number(gstRate || 0) / 100) * 100) / 100;
    const grandTotal = Math.round((taxable + gstAmount) * 100) / 100;

    let subsidyAmount = 0;
    let farmerContribution = grandTotal;
    if (isSubsidyBased && subsidyPercentage) {
      subsidyAmount = Math.round(subtotal * (Number(subsidyPercentage) / 100) * 100) / 100;
      farmerContribution = Math.max(0, Math.round((grandTotal - subsidyAmount) * 100) / 100);
    }

    return { subtotal, gstAmount, grandTotal, subsidyAmount, farmerContribution };
  }, [items, fileExpense, otherCharges, gstRate, isSubsidyBased, subsidyPercentage]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit ? api.put(`/quotations/${id}`, payload) : api.post("/quotations", payload),
    onSuccess: (data: any) => {
      navigate(`/admin/quotations/${data.id}`);
    },
  });

  function handleSave() {
    if (!items.length) {
      alert("Please add at least one item to the quotation.");
      return;
    }

    let payload: any = {
      schemeId: schemeId || null,
      isSubsidyBased,
      subsidyPercentage: subsidyPercentage === "" ? null : Number(subsidyPercentage),
      landArea: landArea === "" ? null : Number(landArea),
      spacing: spacing || null,
      crop: crop || null,
      fileExpense: Number(fileExpense || 0),
      otherCharges: Number(otherCharges || 0),
      gstRate: Number(gstRate || 5),
      notes: notes || null,
      items: items.map((it) => ({
        productId: it.productId ?? null,
        description: it.description,
        quantity: Number(it.quantity),
        unit: it.unit,
        governmentRate: it.governmentRate ?? null,
        sellingRate: Number(it.sellingRate),
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
        aadhar: aadhar.trim() || null,
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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isEdit ? "Edit Quotation / कोटेशन संपादित करा" : "New Drip Quotation / नवीन ठिबक कोटेशन"}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Shetkari Raja More Hardware / Sona Drip Irrigation Quotation Generator
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/quotations")}>
            {t("cancel")}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFarmerReady || !items.length || saveMutation.isPending}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-medium px-5"
          >
            {saveMutation.isPending ? "Saving..." : isEdit ? "Update Quotation" : "Save Quotation / कोटेशन जतन करा"}
          </Button>
        </div>
      </div>

      {/* ── Section 1: Farmer / Customer Details ── */}
      <Card className="border-emerald-200/60 shadow-sm">
        <CardHeader className="bg-emerald-50/50 pb-3 border-b border-emerald-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold text-emerald-950 flex items-center gap-2">
              <UserCheck size={18} className="text-emerald-700" />
              1. शेतकरी तपशील (Farmer / Customer Information)
            </CardTitle>
            <div className="flex rounded-md bg-white border border-border p-0.5 text-xs">
              <button
                type="button"
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  customerMode === "search" ? "bg-emerald-700 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => {
                  setCustomerMode("search");
                }}
              >
                <Search size={12} className="inline mr-1" />
                हजेरीतून शोधा (Search Existing)
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  customerMode === "new" ? "bg-emerald-700 text-white" : "text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => {
                  setCustomerMode("new");
                  setSelectedCustomer(null);
                }}
              >
                <UserPlus size={12} className="inline mr-1" />
                नवीन शेतकरी (New Farmer / Walk-in)
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {customerMode === "search" && (
            <div>
              {selectedCustomer ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50/40 p-3">
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
                    className="border-emerald-600 text-emerald-700 hover:bg-emerald-50"
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
                      placeholder="उदा. Sunita More किंवा 7447243028..."
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
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 transition-colors border-b border-border/50 last:border-0"
                        >
                          <span className="font-semibold text-foreground">{c.fullName}</span> —{" "}
                          <span className="text-muted-foreground">{c.mobile}</span>{" "}
                          {c.village ? `· गाव: ${c.village}` : ""}{" "}
                          {c.gatNumber ? `· गट: ${c.gatNumber}` : ""}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    किंवा शेतकरी प्रणालीत नसल्यास वर "नवीन शेतकरी (New Farmer)" टॅब निवडा.
                  </p>
                </div>
              )}
            </div>
          )}

          {customerMode === "new" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">शेतकऱ्याचे नाव (Farmer Name) *</Label>
                <Input
                  placeholder="उदा. Sunita Bhausaheb More"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">मोबाईल नंबर (Mobile) *</Label>
                <Input
                  placeholder="उदा. 7447243028"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">गाव / पत्ता (Village / Address)</Label>
                <Input
                  placeholder="उदा. Lakh Khandala"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">आधार क्रमांक (Aadhaar No)</Label>
                <Input
                  placeholder="उदा. 6840 0023 0323"
                  value={aadhar}
                  onChange={(e) => setAadhar(e.target.value)}
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
                  placeholder="उदा. छ. संभाजीनगर"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">गट क्र. / p1 (Gat / Survey No)</Label>
                <Input
                  placeholder="उदा. 27 / p1"
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
                  placeholder="उदा. 0.40"
                  value={landArea}
                  onChange={(e) => setLandArea(e.target.value === "" ? "" : Number(e.target.value))}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">लागवडीचे अंतर (Spacing)</Label>
                <Input
                  placeholder="उदा. 1.2 x 0.6"
                  value={spacing}
                  onChange={(e) => setSpacing(e.target.value)}
                  className="bg-white"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">पिकाचे नाव (Crop)</Label>
                <Input
                  placeholder="उदा. कांदा / उस / डाळिंब"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          )}

          {/* Scheme & Subsidy Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-border/60">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">शासकीय योजना (Scheme)</Label>
              <select
                className="flex h-9 w-full rounded-md border border-border bg-background px-2 text-xs"
                value={schemeId}
                onChange={(e) => setSchemeId(e.target.value)}
              >
                <option value="">None / कोणतीही नाही</option>
                {schemes?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.schemeName} ({s.financialYear})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={isSubsidyBased}
                  onChange={(e) => setIsSubsidyBased(e.target.checked)}
                  className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                />
                शासकीय अनुदान (Subsidy-based)
              </label>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">अनुदान टक्केवारी (Subsidy %)</Label>
              <div className="flex gap-1.5 items-center">
                <Input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={subsidyPercentage}
                  onChange={(e) => setSubsidyPercentage(e.target.value === "" ? "" : Number(e.target.value))}
                  disabled={!isSubsidyBased}
                  className="w-24"
                />
                <div className="flex gap-1">
                  {[80, 75, 55].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      disabled={!isSubsidyBased}
                      onClick={() => setSubsidyPercentage(pct)}
                      className={`text-xs px-2 py-1 rounded border ${
                        subsidyPercentage === pct
                          ? "bg-emerald-700 text-white border-emerald-700 font-bold"
                          : "bg-white text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">जीएसटी दर (GST Rate)</Label>
              <div className="flex gap-1.5 items-center">
                <Input
                  type="number"
                  step="1"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="w-20"
                />
                <div className="flex gap-1">
                  {[5, 12, 18].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGstRate(g)}
                      className={`text-xs px-2 py-1 rounded border ${
                        gstRate === g
                          ? "bg-blue-700 text-white border-blue-700 font-bold"
                          : "bg-white text-muted-foreground border-border hover:bg-muted"
                      }`}
                    >
                      {g}%
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 2: Items Table ── */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-700" />
            2. साहित्याची यादी (Quotation Items)
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            एकूण घटक: <span className="font-semibold text-foreground">{items.length}</span>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Quick preset buttons for common drip parts */}
          <div>
            <Label className="text-xs font-semibold text-muted-foreground block mb-1.5">
              वारंवार लागणारे साहित्य त्वरित जोडा (Quick Add Common Items):
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_DRIP_ITEMS.slice(0, 10).map((it) => (
                <button
                  key={it.name}
                  type="button"
                  onClick={() => addPresetItem(it)}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 transition-colors"
                >
                  + {it.name} ({formatInr(it.rate)})
                </button>
              ))}
            </div>
          </div>

          {/* Product Search from Database */}
          <div className="relative max-w-md">
            <Input
              placeholder="कॅटलॉगमधून प्रॉडक्ट शोधा (Search catalog)..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
            />
            {productResults && productResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-lg">
                {productResults.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-muted border-b border-border/40 last:border-0"
                  >
                    <span className="font-medium">{p.name}</span> — {formatInr(p.sellingRate)}/{p.unit}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="border border-border rounded-lg overflow-x-auto">
            <Table>
              <THead>
                <TR className="bg-slate-100/80">
                  <TH className="w-12 text-center">क्र.</TH>
                  <TH className="min-w-[260px]">साहित्याचे नाव (Description / Item Name)</TH>
                  <TH className="w-28 text-right">संख्या / मीटर (Qty)</TH>
                  <TH className="w-24 text-center">युनिट (Unit)</TH>
                  <TH className="w-32 text-right">दर (Rate ₹)</TH>
                  <TH className="w-36 text-right">एकूण (Amount ₹)</TH>
                  <TH className="w-12 text-center"></TH>
                </TR>
              </THead>
              <TBody>
                {items.map((it, idx) => {
                  const amt = (Number(it.quantity) || 0) * (Number(it.sellingRate) || 0);
                  return (
                    <TR key={idx} className="hover:bg-slate-50/60">
                      <TD className="text-center font-medium text-muted-foreground">{idx + 1}</TD>
                      <TD>
                        <Input
                          value={it.description}
                          onChange={(e) => updateItem(idx, { description: e.target.value })}
                          placeholder="Item name"
                          className="h-8 text-sm"
                        />
                      </TD>
                      <TD>
                        <Input
                          type="number"
                          step="0.01"
                          value={it.quantity}
                          onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                          className="h-8 text-sm text-right"
                        />
                      </TD>
                      <TD>
                        <Input
                          value={it.unit}
                          onChange={(e) => updateItem(idx, { unit: e.target.value })}
                          className="h-8 text-sm text-center"
                        />
                      </TD>
                      <TD>
                        <Input
                          type="number"
                          step="0.01"
                          value={it.sellingRate}
                          onChange={(e) => updateItem(idx, { sellingRate: Number(e.target.value) })}
                          className="h-8 text-sm text-right font-medium"
                        />
                      </TD>
                      <TD className="text-right font-semibold text-foreground">
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
              <Plus size={14} className="mr-1" /> नवीन ओळ जोडा (Add Blank Line)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Section 3: Charges, GST, and Subsidy Breakdown ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Charges Inputs */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold">3. अतिरिक्त खर्च व नोंदी (Charges & Notes)</CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">फाइल खर्च (File Exp / Documentation)</Label>
              <Input
                type="number"
                step="50"
                value={fileExpense}
                onChange={(e) => setFileExpense(Number(e.target.value))}
                placeholder="1500"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">इतर खर्च (Other Charges)</Label>
              <Input
                type="number"
                step="50"
                value={otherCharges}
                onChange={(e) => setOtherCharges(Number(e.target.value))}
                placeholder="0"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">नोंद / शेरा (Notes)</Label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="उदा. ड्रिप मॉडेल, कंपनी, किंवा वॉरंटी संबंधी नोंद..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Real-time Financial Breakdown matching physical paper */}
        <Card className="shadow-sm border-emerald-300 bg-gradient-to-br from-white to-emerald-50/30">
          <CardHeader className="pb-3 border-b border-emerald-100 bg-emerald-50/60">
            <CardTitle className="text-base font-semibold text-emerald-950">
              4. कोटेशन हिशोब सारांश (Quotation Summary)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>साहित्य एकूण (Material Subtotal):</span>
              <span className="font-semibold text-foreground">{formatInr(calculation.subtotal)}</span>
            </div>

            {Number(fileExpense) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>फाइल खर्च (File Exp):</span>
                <span className="font-semibold text-foreground">{formatInr(fileExpense)}</span>
              </div>
            )}

            {Number(otherCharges) > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>इतर खर्च (Other Charges):</span>
                <span className="font-semibold text-foreground">{formatInr(otherCharges)}</span>
              </div>
            )}

            <div className="flex justify-between text-muted-foreground">
              <span>ADD GST @{gstRate}%:</span>
              <span className="font-semibold text-foreground">{formatInr(calculation.gstAmount)}</span>
            </div>

            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-foreground">
              <span>एकूण बिल (Total Amt):</span>
              <span className="text-blue-900">{formatInr(calculation.grandTotal)}</span>
            </div>

            {isSubsidyBased && (
              <div className="mt-3 pt-3 border-t-2 border-emerald-200 bg-emerald-50/80 p-3 rounded-md space-y-2">
                <div className="flex justify-between text-emerald-800 font-medium text-sm">
                  <span>अनुदान वजा {subsidyPercentage}% (Govt Subsidy):</span>
                  <span>- {formatInr(calculation.subsidyAmount)}</span>
                </div>
                <div className="flex justify-between text-emerald-950 font-bold text-lg pt-1 border-t border-emerald-200">
                  <span>शेतकरी भरणा (Farmer Share to Pay):</span>
                  <span className="text-emerald-700">{formatInr(calculation.farmerContribution)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" size="lg" onClick={() => navigate("/admin/quotations")}>
          {t("cancel")}
        </Button>
        <Button
          size="lg"
          onClick={handleSave}
          disabled={!isFarmerReady || !items.length || saveMutation.isPending}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-8"
        >
          {saveMutation.isPending ? "Saving..." : isEdit ? "Update Quotation" : "Save Quotation / कोटेशन जतन करा"}
        </Button>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Plus,
  Trash2,
  Search,
  UserCheck,
  UserPlus,
  Droplets,
  Zap,
  Sparkles,
  Minus,
} from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatInr } from "@/lib/utils";
import {
  KSR_EXCEL_ITEMS,
  PHOTO_REFERENCE_ITEMS,
  get1AcreKsrItems,
  getAllKsrExcelItems,
} from "@/data/miniSprinklerData";

interface Customer {
  id: string;
  fullName: string;
  mobile: string;
  village?: string | null;
  taluka?: string | null;
  district?: string | null;
  gatNumber?: string | null;
  landArea?: number | null;
  crop?: string | null;
}

interface ItemRow {
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

export default function MiniSprinklerInvoiceBuilderPage() {
  const navigate = useNavigate();
  const [customerMode, setCustomerMode] = useState<"search" | "new">("search");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Farmer details
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("Lakh Khandala");
  const [shiwar, setShiwar] = useState("");
  const [taluka, setTaluka] = useState("Vaijapur");
  const [district, setDistrict] = useState("छ. संभाजीनगर");
  const [gatNumber, setGatNumber] = useState("");
  const [crop, setCrop] = useState("कांदा");
  const [landArea, setLandArea] = useState<number | "">(1.0);
  const [spacing, setSpacing] = useState("१२ मी. X १२ मी.");

  // Settings
  const [gstRate, setGstRate] = useState(5); // 5% default for agricultural sprinkler
  const [farmerShare, setFarmerShare] = useState<number | "">(14000);
  const [discount, setDiscount] = useState(0);
  const [installation, setInstallation] = useState(0);
  const [notes, setNotes] = useState("");
  const [lang, setLang] = useState<"en" | "mr">("en");

  // Items initialized with 1 Acre preset from Excel!
  const [items, setItems] = useState<ItemRow[]>(() =>
    get1AcreKsrItems("en").map((it: any) => ({
      description: it.description,
      quantity: it.quantity,
      unit: it.unit,
      rate: it.rate,
      gstRate: 5,
    }))
  );

  const [productSearch, setProductSearch] = useState("");

  const { data: customerResults } = useQuery({
    queryKey: ["customer-search", customerSearch],
    queryFn: () => api.get<Customer[]>(`/customers?search=${encodeURIComponent(customerSearch)}&limit=8`),
    enabled: customerSearch.length > 1,
  });

  const { data: productResults } = useQuery({
    queryKey: ["product-search", productSearch],
    queryFn: () => api.get<any[]>(`/products?search=${encodeURIComponent(productSearch)}&limit=8`),
    enabled: productSearch.length > 1,
  });

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

  // Presets
  function apply1AcrePreset(selectedLang = lang) {
    setLandArea(1.0);
    const newItems = get1AcreKsrItems(selectedLang).map((it: any) => ({
      description: it.description,
      quantity: it.quantity,
      unit: it.unit,
      rate: it.rate,
      gstRate,
    }));
    setItems(newItems);
  }

  function applyPhotoReferencePreset() {
    setLandArea(1.0);
    setFarmerShare(14000);
    setGstRate(5);
    setItems(
      PHOTO_REFERENCE_ITEMS.map((it: any) => ({
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        rate: it.rate,
        gstRate: 5,
      }))
    );
  }

  function applyAll23KsrItems(selectedLang = lang) {
    const newItems = getAllKsrExcelItems(selectedLang).map((it: any) => ({
      description: it.description,
      quantity: it.quantity,
      unit: it.unit,
      rate: it.rate,
      gstRate,
    }));
    setItems(newItems);
  }

  function scaleAcreage(factor: number) {
    setLandArea(factor);
    setItems((prev) =>
      prev.map((it) => ({
        ...it,
        quantity: Math.max(1, Math.round(it.quantity * factor)),
      }))
    );
  }

  function toggleLanguage() {
    const nextLang = lang === "en" ? "mr" : "en";
    setLang(nextLang);
    setItems((prev) =>
      prev.map((it) => {
        const found = KSR_EXCEL_ITEMS.find(
          (k: any) => k.nameEn === it.description || k.nameMr === it.description
        );
        if (found) {
          return {
            ...it,
            description: nextLang === "mr" ? found.nameMr : found.nameEn,
          };
        }
        return it;
      })
    );
  }

  function updateItem(idx: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }

  function stepQuantity(idx: number, delta: number) {
    setItems((prev) =>
      prev.map((it, i) => {
        if (i !== idx) return it;
        const current = Number(it.quantity) || 0;
        const nextVal = Math.max(0, current + delta);
        return { ...it, quantity: nextVal };
      })
    );
  }

  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  function addBlankItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit: "NOS", rate: 0, gstRate },
    ]);
  }

  function addProduct(p: any) {
    setItems((prev) => [
      ...prev,
      {
        productId: p.id,
        description: p.name,
        quantity: 1,
        unit: p.unit || "NOS",
        rate: Number(p.sellingRate),
        govRate: p.governmentRate ? Number(p.governmentRate) : null,
        gstRate: Number(p.gstRate || gstRate),
      },
    ]);
    setProductSearch("");
  }

  const calculation = useMemo(() => {
    const grossAmount = items.reduce(
      (s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0),
      0
    );
    const taxableBase = Math.max(
      0,
      grossAmount - Number(discount || 0) + Number(installation || 0)
    );
    const halfGst = Number(gstRate || 5) / 2;
    const cgst = Math.round(taxableBase * (halfGst / 100) * 100) / 100;
    const sgst = Math.round(taxableBase * (halfGst / 100) * 100) / 100;
    const totalGst = Math.round((cgst + sgst) * 100) / 100;
    const rawBill = taxableBase + totalGst;
    const roundedBill = Math.round(rawBill);
    const roundOff = Math.round((roundedBill - rawBill) * 100) / 100;

    const farmerShareNum = farmerShare === "" ? 0 : Number(farmerShare);
    const balance = Math.max(0, Math.round((roundedBill - farmerShareNum) * 100) / 100);

    return {
      grossAmount,
      taxableBase,
      cgst,
      sgst,
      totalGst,
      roundOff,
      billAmount: roundedBill,
      farmerShare: farmerShareNum,
      balance,
    };
  }, [items, discount, installation, gstRate, farmerShare]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => api.post("/invoices", payload),
    onSuccess: (data: any) => navigate(`/admin/invoices/${data.id}`),
  });

  function handleSave() {
    if (!items.length) {
      alert("कृपया किमान एक घटक जोडा (Please add at least one item).");
      return;
    }
    const payload: any = {
      setType: "मिनी स्प्रिंकलर",
      spacing: spacing || null,
      crop: crop || null,
      shiwar: shiwar || null,
      discount: Number(discount || 0),
      installation: Number(installation || 0),
      roundOff: calculation.roundOff,
      gstRate: Number(gstRate),
      notes: notes
        ? `मिनी स्प्रिंकलर बिल | शेतकरी हिस्सा: ${calculation.farmerShare} | ${notes}`
        : `मिनी स्प्रिंकलर बिल | शेतकरी हिस्सा: ${calculation.farmerShare}`,
      items: items.map((it, i) => ({
        productId: it.productId ?? null,
        description: it.description,
        batchNo: it.batchNo || null,
        cmlNo: it.cmlNo || null,
        size: it.size || null,
        quantity: Number(it.quantity),
        unit: it.unit || "NOS",
        govRate: it.govRate ?? null,
        rate: Number(it.rate),
        taxableValue: Math.round(Number(it.quantity) * Number(it.rate) * 100) / 100,
        gstRate: Number(it.gstRate || gstRate),
        sortOrder: i,
      })),
    };

    if (selectedCustomer) {
      payload.customerId = selectedCustomer.id;
    } else {
      if (!fullName.trim() || !mobile.trim()) {
        alert("कृपया शेतकऱ्याचे नाव व मोबाईल नंबर टाका (Please enter Farmer Name & Mobile).");
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

  const isFarmerReady = Boolean(
    selectedCustomer || (fullName.trim() && mobile.trim().length >= 10)
  );

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4 bg-white/50 p-4 rounded-xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
              <Droplets size={22} />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                मिनी स्प्रिंकलर टॅक्स इन्व्हॉईस (Mini Sprinkler Tax Invoice)
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                KSR मिनी स्प्रिंकलर (अर्ध-कायमस्वरूपी) — SHETKARI RAJA HARDWARE AND ELECTRICALS
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/invoices")}>
            रद्द करा (Cancel)
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isFarmerReady || !items.length || saveMutation.isPending}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-6 shadow-sm"
          >
            {saveMutation.isPending ? "तयार होत आहे..." : "बिल तयार करा (Generate Invoice)"}
          </Button>
        </div>
      </div>

      {/* 1-Click Quick Presets Banner */}
      <Card className="border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white shadow-xs">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                <Zap size={16} className="text-amber-500 fill-amber-500" />
                1-Click Quick Presets (एका क्लिकवर संच भरा)
              </h3>
              <p className="text-xs text-emerald-800">
                KSR_Mini_Sprinkler.xlsx मधील अधिकृत दरांनुसार थेट प्रमाण आणि दर आपोआप भरले जातील.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => apply1AcrePreset(lang)}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold gap-1.5 shadow-xs"
              >
                <Zap size={13} /> ⚡ 1-Click 1 Acre Kit (१ एकर संच)
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={applyPhotoReferencePreset}
                className="border-emerald-600 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold gap-1.5"
              >
                <Sparkles size={13} /> 📸 Reference Bill (फोटोप्रमाणे 40 Nozzles)
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => applyAll23KsrItems(lang)}
                className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
              >
                📋 All 23 KSR Items
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={toggleLanguage}
                className="border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 text-xs font-medium"
              >
                🌐 भाषा: {lang === "en" ? "English" : "मराठी"}
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-emerald-200/60 text-xs">
            <span className="font-semibold text-emerald-900">क्षेत्रानुसार प्रमाण बदला (Scale by Acre):</span>
            {[0.5, 1, 1.5, 2, 3].map((ac) => (
              <button
                key={ac}
                type="button"
                onClick={() => scaleAcreage(ac)}
                className={`px-2.5 py-1 rounded border font-medium transition-colors ${
                  landArea === ac
                    ? "bg-emerald-700 text-white border-emerald-700"
                    : "bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100"
                }`}
              >
                {ac} एकर
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 1. Farmer Details */}
      <Card className="border-border shadow-xs">
        <CardHeader className="bg-slate-50/70 pb-3 border-b border-border">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
              <UserCheck size={18} className="text-emerald-700" />
              1. शेतकरी माहिती (Customer Information)
            </CardTitle>
            <div className="flex rounded-md bg-white border border-border p-0.5 text-xs">
              <button
                type="button"
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  customerMode === "search"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-muted-foreground"
                }`}
                onClick={() => setCustomerMode("search")}
              >
                <Search size={12} className="inline mr-1" />
                हजेरीतून शोधा
              </button>
              <button
                type="button"
                className={`px-3 py-1 rounded font-medium transition-colors ${
                  customerMode === "new"
                    ? "bg-emerald-100 text-emerald-800"
                    : "text-muted-foreground"
                }`}
                onClick={() => {
                  setCustomerMode("new");
                  setSelectedCustomer(null);
                }}
              >
                <UserPlus size={12} className="inline mr-1" />
                नवीन शेतकरी
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {customerMode === "search" && (
            <div>
              {selectedCustomer ? (
                <div className="flex items-center justify-between rounded-lg border border-emerald-300 bg-emerald-50/50 p-3">
                  <div>
                    <p className="font-semibold text-foreground text-base">
                      {selectedCustomer.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      मोबाईल:{" "}
                      <span className="font-medium text-foreground">
                        {selectedCustomer.mobile}
                      </span>{" "}
                      · गाव: {selectedCustomer.village || "-"} · तालुका:{" "}
                      {selectedCustomer.taluka || "Vaijapur"}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-600 text-emerald-700"
                    onClick={() => setSelectedCustomer(null)}
                  >
                    बदला (Change)
                  </Button>
                </div>
              ) : (
                <div className="relative max-w-lg">
                  <Label className="mb-1 block text-xs font-semibold text-muted-foreground">
                    नाव किंवा मोबाईल नंबरने शोधा
                  </Label>
                  <div className="relative">
                    <Search
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      placeholder="उदा. Vaibhav Santosh More किंवा 8010741843..."
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
                          className="block w-full px-3 py-2 text-left text-sm hover:bg-emerald-50 border-b border-border/50 last:border-0"
                        >
                          <span className="font-semibold">{c.fullName}</span> —{" "}
                          <span className="text-muted-foreground">{c.mobile}</span>
                          {c.village ? ` · गाव: ${c.village}` : ""}
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
                <Label className="text-xs font-semibold">शेतकऱ्याचे नाव *</Label>
                <Input
                  placeholder="उदा. Vaibhav Santosh More"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">मोबाईल नंबर *</Label>
                <Input
                  placeholder="उदा. 8010741843"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">गाव (Village)</Label>
                <Input
                  placeholder="Lakh Khandala"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">तालुका (Taluka)</Label>
                <Input
                  placeholder="Vaijapur"
                  value={taluka}
                  onChange={(e) => setTaluka(e.target.value)}
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
                <Label className="text-xs font-semibold">गट नं.</Label>
                <Input
                  placeholder="उदा. ४२"
                  value={gatNumber}
                  onChange={(e) => setGatNumber(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">क्षेत्र (Acre)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={landArea}
                  onChange={(e) =>
                    setLandArea(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">पिक</Label>
                <Input
                  placeholder="कांदा"
                  value={crop}
                  onChange={(e) => setCrop(e.target.value)}
                  className="bg-white"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Items Table */}
      <Card className="border-border shadow-xs">
        <CardHeader className="bg-slate-50/70 pb-3 border-b border-border flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Droplets size={18} className="text-emerald-700" />
            2. PRODUCT DETAILS (साहित्याची यादी)
          </CardTitle>
          <div className="text-xs text-muted-foreground">
            घटक संख्या: <b className="text-foreground">{items.length}</b>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="relative max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="उत्पादन शोधा..."
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-9 h-8 text-xs"
            />
            {productResults && productResults.length > 0 && (
              <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow-lg overflow-hidden">
                {productResults.map((p: any) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p)}
                    className="block w-full px-3 py-2 text-left text-xs hover:bg-emerald-50 border-b border-border/50 last:border-0"
                  >
                    <span className="font-semibold">{p.name}</span>
                    <span className="ml-2 text-muted-foreground">
                      {formatInr(p.sellingRate)} / {p.unit}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="border border-slate-300 rounded-lg overflow-x-auto shadow-2xs">
            <Table>
              <THead>
                <TR className="bg-slate-100 text-xs border-b border-slate-300">
                  <TH className="w-12 text-center font-bold">Sr No</TH>
                  <TH className="min-w-[280px] font-bold">Product Description</TH>
                  <TH className="w-36 text-center font-bold">Quantity (प्रमाण)</TH>
                  <TH className="w-20 text-center font-bold">Unit</TH>
                  <TH className="w-28 text-right font-bold">Rate (Rs.)</TH>
                  <TH className="w-32 text-right font-bold">Amount (Rs.)</TH>
                  <TH className="w-10 text-center"></TH>
                </TR>
              </THead>
              <TBody>
                {items.map((it, idx) => {
                  const amt = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
                  return (
                    <TR
                      key={idx}
                      className="border-b border-slate-200 hover:bg-emerald-50/20 text-xs"
                    >
                      <TD className="text-center font-medium text-muted-foreground">
                        {idx + 1}
                      </TD>
                      <TD>
                        <Input
                          value={it.description}
                          onChange={(e) =>
                            updateItem(idx, { description: e.target.value })
                          }
                          className="h-8 text-xs font-medium"
                        />
                      </TD>
                      <TD>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => stepQuantity(idx, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold active:scale-95"
                            title="Decrease quantity"
                          >
                            <Minus size={12} />
                          </button>
                          <Input
                            type="number"
                            step="1"
                            value={it.quantity}
                            onChange={(e) =>
                              updateItem(idx, {
                                quantity: Number(e.target.value),
                              })
                            }
                            className="h-7 w-16 text-center font-bold text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => stepQuantity(idx, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded border border-slate-300 bg-slate-50 hover:bg-slate-200 text-slate-700 font-bold active:scale-95"
                            title="Increase quantity"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </TD>
                      <TD>
                        <Input
                          value={it.unit}
                          onChange={(e) => updateItem(idx, { unit: e.target.value })}
                          className="h-8 text-xs text-center uppercase"
                        />
                      </TD>
                      <TD>
                        <Input
                          type="number"
                          step="0.01"
                          value={it.rate}
                          onChange={(e) =>
                            updateItem(idx, { rate: Number(e.target.value) })
                          }
                          className="h-8 text-xs text-right font-medium"
                        />
                      </TD>
                      <TD className="text-right font-bold text-foreground pr-4">
                        {amt.toFixed(2)}
                      </TD>
                      <TD className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(idx)}
                        >
                          <Trash2 size={13} />
                        </Button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>

          <div className="flex justify-between items-center pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={addBlankItem}
              className="border-dashed text-xs gap-1"
            >
              <Plus size={13} /> नवीन आयटम जोडा
            </Button>
            <span className="text-xs text-muted-foreground italic">
              टीप: वरील दर KSR_Mini_Sprinkler.xlsx मधील अधिकृत दरांनुसार आहेत.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* 3. Totals & Pricing Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border shadow-xs">
          <CardHeader className="bg-slate-50/70 pb-3 border-b border-border">
            <CardTitle className="text-base font-semibold">
              3. GST व अतिरिक्त पर्याय
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">GST दर (%)</Label>
                <Input
                  type="number"
                  value={gstRate}
                  onChange={(e) => setGstRate(Number(e.target.value))}
                  className="font-medium"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">शेतकरी हिस्सा (FARMER SHARE)</Label>
                <Input
                  type="number"
                  value={farmerShare}
                  onChange={(e) =>
                    setFarmerShare(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="font-bold text-emerald-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">डिस्काउंट (₹)</Label>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-semibold">इन्स्टॉलेशन (₹)</Label>
                <Input
                  type="number"
                  value={installation}
                  onChange={(e) => setInstallation(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <Label className="text-xs font-semibold">नोंद (Custom Note / Terms)</Label>
              <Input
                placeholder="उदा. टेस्ट इन्व्हॉईस नोंद..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Clean Totals Card */}
        <Card className="border-slate-400 bg-white shadow-xs">
          <CardHeader className="bg-slate-100 pb-3 border-b border-slate-300">
            <CardTitle className="text-base font-bold text-center tracking-wide">
              बिल सारांश (TOTAL SUMMARY)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 p-5 space-y-0">
            <div className="border border-slate-400 rounded-md overflow-hidden text-sm">
              <div className="flex justify-between items-center py-2 px-4 border-b border-slate-300">
                <span className="font-semibold text-slate-800">TOTAL</span>
                <span className="font-bold text-slate-900">
                  {calculation.taxableBase.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 px-4 border-b border-slate-300 bg-slate-50/50">
                <span className="text-slate-700">GST {gstRate}%</span>
                <span className="font-semibold text-slate-900">
                  {calculation.totalGst.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5 px-4 border-b border-slate-400 bg-slate-100 font-bold text-base">
                <span className="text-slate-900">GRAND TOTAL</span>
                <span className="text-slate-950">
                  {calculation.billAmount.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2 px-4 border-b border-slate-300 bg-emerald-50/40">
                <span className="font-semibold text-emerald-900">FARMER SHARE</span>
                <span className="font-bold text-emerald-900">
                  {calculation.farmerShare.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center py-2.5 px-4 bg-amber-50/50 font-bold text-base">
                <span className="text-amber-950">BALANCE</span>
                <span className="text-amber-950">
                  {calculation.balance.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
        <Button variant="outline" size="lg" onClick={() => navigate("/admin/invoices")}>
          रद्द करा (Cancel)
        </Button>
        <Button
          size="lg"
          onClick={handleSave}
          disabled={!isFarmerReady || !items.length || saveMutation.isPending}
          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-8 shadow-sm"
        >
          {saveMutation.isPending ? "तयार होत आहे..." : "बिल तयार करा (Generate Invoice)"}
        </Button>
      </div>
    </div>
  );
}

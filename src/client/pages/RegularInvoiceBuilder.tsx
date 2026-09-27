import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus, Trash2, Search, UserCheck, UserPlus, ShoppingCart } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatInr } from "@/lib/utils";

interface Customer {
  id: string; fullName: string; mobile: string;
  village?: string | null; taluka?: string | null; district?: string | null;
  gatNumber?: string | null; landArea?: number | null; crop?: string | null;
}

interface ItemRow {
  productId?: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  gstRate: number;
}

export default function RegularInvoiceBuilderPage() {
  const navigate = useNavigate();
  const [customerMode, setCustomerMode] = useState<"search" | "new">("search");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [village, setVillage] = useState("");
  const [taluka, setTaluka] = useState("वैजापूर");
  const [district, setDistrict] = useState("छ.सं.नगर");
  const [gstRate, setGstRate] = useState(18);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ description: "", quantity: 1, unit: "Nos", rate: 0, gstRate: 18 }]);
  const [productSearch, setProductSearch] = useState("");

  const { data: customerResults } = useQuery({
    queryKey: ["customer-search", customerSearch],
    queryFn: () => api.get<Customer[]>(`/customers?search=${customerSearch}&limit=8`),
    enabled: customerSearch.length > 1,
  });

  const { data: productResults } = useQuery({
    queryKey: ["product-search", productSearch],
    queryFn: () => api.get<any[]>(`/products?search=${productSearch}&limit=8`),
    enabled: productSearch.length > 1,
  });

  function selectCustomer(c: Customer) {
    setSelectedCustomer(c); setCustomerSearch("");
    if (c.village) setVillage(c.village);
    if (c.taluka) setTaluka(c.taluka);
    if (c.district) setDistrict(c.district);
  }

  function addProduct(p: any) {
    setItems(prev => [...prev, { productId: p.id, description: p.name, quantity: 1, unit: p.unit, rate: Number(p.sellingRate), gstRate: Number(p.gstRate || gstRate) }]);
    setProductSearch("");
  }

  function addBlankItem() { setItems(prev => [...prev, { description: "", quantity: 1, unit: "Nos", rate: 0, gstRate }]); }
  function updateItem(idx: number, patch: Partial<ItemRow>) { setItems(prev => prev.map((it, i) => i === idx ? { ...it, ...patch } : it)); }
  function removeItem(idx: number) { setItems(prev => prev.filter((_, i) => i !== idx)); }

  const calculation = useMemo(() => {
    const grossAmount = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0);
    const taxableBase = Math.max(0, grossAmount - Number(discount || 0));
    const halfGst = Number(gstRate || 18) / 2;
    const cgst = Math.round(taxableBase * (halfGst / 100) * 100) / 100;
    const sgst = Math.round(taxableBase * (halfGst / 100) * 100) / 100;
    const totalGst = Math.round((cgst + sgst) * 100) / 100;
    const rawBill = taxableBase + totalGst;
    const roundedBill = Math.round(rawBill);
    const roundOff = Math.round((roundedBill - rawBill) * 100) / 100;
    return { grossAmount, taxableBase, cgst, sgst, totalGst, roundOff, billAmount: roundedBill };
  }, [items, discount, gstRate]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => api.post("/invoices", payload),
    onSuccess: (data: any) => navigate("/admin/invoices"),
  });

  function handleSave() {
    if (!items.length) { alert("Please add at least one item."); return; }
    const payload: any = {
      setType: "रेग्युलर बिल", discount: Number(discount || 0), installation: 0,
      roundOff: calculation.roundOff, gstRate: Number(gstRate),
      notes: notes || "रेग्युलर कॅश बिल",
      items: items.map((it, i) => ({
        productId: it.productId ?? null, description: it.description, quantity: Number(it.quantity),
        unit: it.unit || "Nos", rate: Number(it.rate),
        taxableValue: Math.round(Number(it.quantity) * Number(it.rate) * 100) / 100,
        gstRate: Number(it.gstRate || gstRate), sortOrder: i,
      })),
    };
    if (selectedCustomer) {
      payload.customerId = selectedCustomer.id;
    } else {
      if (!fullName.trim() || !mobile.trim()) { alert("Please enter Customer Name and Mobile."); return; }
      payload.customer = { fullName: fullName.trim(), mobile: mobile.trim(), village: village.trim() || null, taluka: taluka.trim() || null, district: district.trim() || null };
    }
    saveMutation.mutate(payload);
  }

  const isFarmerReady = Boolean(selectedCustomer || (fullName.trim() && mobile.trim().length >= 10));

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ShoppingCart className="text-orange-600" />
            Regular Cash Bill / रेग्युलर कॅश बिल
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">सोना इरिगेशन / शेतकरी राजा मोरे हार्डवेअर (GSTIN: 27ABVPT3736N1Z9)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/admin/invoices")}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isFarmerReady || !items.length || saveMutation.isPending} className="bg-orange-700 hover:bg-orange-800 text-white font-medium px-5">
            {saveMutation.isPending ? "Generating..." : "Generate Bill"}
          </Button>
        </div>
      </div>

      <Card className="border-orange-200/60 shadow-sm">
        <CardHeader className="bg-orange-50/50 pb-3 border-b border-orange-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold text-orange-950 flex items-center gap-2">
              <UserCheck size={18} className="text-orange-700" />1. Customer / ग्राहक माहिती
            </CardTitle>
            <div className="flex rounded-md bg-white border border-border p-0.5 text-xs">
              <button type="button" className={`px-3 py-1 rounded font-medium transition-colors ${customerMode === "search" ? "bg-orange-100 text-orange-800" : "text-muted-foreground"}`} onClick={() => setCustomerMode("search")}>
                <Search size={12} className="inline mr-1" />Search
              </button>
              <button type="button" className={`px-3 py-1 rounded font-medium transition-colors ${customerMode === "new" ? "bg-orange-100 text-orange-800" : "text-muted-foreground"}`} onClick={() => { setCustomerMode("new"); setSelectedCustomer(null); }}>
                <UserPlus size={12} className="inline mr-1" />New
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {customerMode === "search" && (
            <div>
              {selectedCustomer ? (
                <div className="flex items-center justify-between rounded-lg border border-orange-300 bg-orange-50/40 p-3">
                  <div>
                    <p className="font-semibold text-foreground text-base">{selectedCustomer.fullName}</p>
                    <p className="text-sm text-muted-foreground">Mobile: <span className="font-medium text-foreground">{selectedCustomer.mobile}</span> · Village: {selectedCustomer.village || "-"}</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-orange-600 text-orange-700" onClick={() => setSelectedCustomer(null)}>Change</Button>
                </div>
              ) : (
                <div className="relative max-w-lg">
                  <Label className="mb-1 block text-xs font-semibold text-muted-foreground">Search by Name or Mobile</Label>
                  <div className="relative">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input placeholder="e.g. Ramdas Patil or 9876543210..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} className="pl-9" />
                  </div>
                  {customerResults && customerResults.length > 0 && (
                    <div className="absolute z-20 mt-1 w-full rounded-md border border-border bg-background shadow-lg overflow-hidden">
                      {customerResults.map(c => (
                        <button key={c.id} type="button" onClick={() => selectCustomer(c)} className="block w-full px-3 py-2 text-left text-sm hover:bg-orange-50 border-b border-border/50 last:border-0">
                          <span className="font-semibold">{c.fullName}</span> — <span className="text-muted-foreground">{c.mobile}</span>{c.village ? ` · ${c.village}` : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          {customerMode === "new" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50/70 p-3.5 rounded-lg border border-slate-200">
              <div className="space-y-1"><Label className="text-xs font-semibold">Customer Name *</Label><Input placeholder="e.g. Ramdas Patil" value={fullName} onChange={e => setFullName(e.target.value)} className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-semibold">Mobile *</Label><Input placeholder="e.g. 9876543210" value={mobile} onChange={e => setMobile(e.target.value)} className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-semibold">Village / गाव</Label><Input placeholder="e.g. Purangaon" value={village} onChange={e => setVillage(e.target.value)} className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-semibold">Taluka / तालुका</Label><Input value={taluka} onChange={e => setTaluka(e.target.value)} className="bg-white" /></div>
              <div className="space-y-1"><Label className="text-xs font-semibold">District / जिल्हा</Label><Input value={district} onChange={e => setDistrict(e.target.value)} className="bg-white" /></div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/60 max-w-sm">
            <div className="space-y-1"><Label className="text-xs font-semibold">GST Rate (%)</Label><Input type="number" value={gstRate} onChange={e => setGstRate(Number(e.target.value))} /></div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Discount (₹)</Label><Input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShoppingCart size={18} className="text-orange-700" />2. Items / साहित्य यादी
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search product..." value={productSearch} onChange={e => setProductSearch(e.target.value)} className="pl-9 w-52" />
              {productResults && productResults.length > 0 && (
                <div className="absolute right-0 z-20 mt-1 w-72 rounded-md border border-border bg-background shadow-lg overflow-hidden">
                  {productResults.map((p: any) => (
                    <button key={p.id} type="button" onClick={() => addProduct(p)} className="block w-full px-3 py-2 text-left text-sm hover:bg-orange-50 border-b border-border/50 last:border-0">
                      <span className="font-semibold">{p.name}</span><span className="ml-2 text-muted-foreground">{formatInr(p.sellingRate)}/{p.unit}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Items: <span className="font-semibold text-foreground">{items.length}</span></span>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="border border-border rounded-lg overflow-x-auto">
            <Table>
              <THead>
                <TR className="bg-orange-50/80 text-xs">
                  <TH className="w-10 text-center">#</TH>
                  <TH className="min-w-[220px]">Description / वर्णन</TH>
                  <TH className="w-20 text-right">Qty</TH>
                  <TH className="w-20 text-center">Unit</TH>
                  <TH className="w-28 text-right">Rate (₹)</TH>
                  <TH className="w-16 text-right">GST%</TH>
                  <TH className="w-28 text-right">Amount (₹)</TH>
                  <TH className="w-10"></TH>
                </TR>
              </THead>
              <TBody>
                {items.map((it, idx) => {
                  const amt = (Number(it.quantity) || 0) * (Number(it.rate) || 0);
                  return (
                    <TR key={idx} className="hover:bg-orange-50/30 text-sm">
                      <TD className="text-center font-medium text-muted-foreground">{idx + 1}</TD>
                      <TD><Input value={it.description} onChange={e => updateItem(idx, { description: e.target.value })} className="h-8 text-xs font-medium" placeholder="Item description" /></TD>
                      <TD><Input type="number" step="0.01" value={it.quantity} onChange={e => updateItem(idx, { quantity: Number(e.target.value) })} className="h-8 text-xs text-right font-medium" /></TD>
                      <TD><Input value={it.unit} onChange={e => updateItem(idx, { unit: e.target.value })} className="h-8 text-xs text-center" /></TD>
                      <TD><Input type="number" step="0.01" value={it.rate} onChange={e => updateItem(idx, { rate: Number(e.target.value) })} className="h-8 text-xs text-right font-semibold" /></TD>
                      <TD><Input type="number" value={it.gstRate} onChange={e => updateItem(idx, { gstRate: Number(e.target.value) })} className="h-8 text-xs text-right" /></TD>
                      <TD className="text-right font-bold text-foreground">{formatInr(amt)}</TD>
                      <TD className="text-center"><Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeItem(idx)}><Trash2 size={14} /></Button></TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </div>
          <Button variant="outline" size="sm" onClick={addBlankItem} className="border-dashed"><Plus size={14} className="mr-1" /> Add Item</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b border-border"><CardTitle className="text-base font-semibold">3. GST Breakdown</CardTitle></CardHeader>
          <CardContent className="pt-4 space-y-3">
            <div className="border border-border rounded-md overflow-hidden">
              <Table>
                <THead><TR className="bg-slate-100 text-xs"><TH>GST%</TH><TH className="text-right">Taxable</TH><TH className="text-right">CGST ({gstRate/2}%)</TH><TH className="text-right">SGST ({gstRate/2}%)</TH><TH className="text-right">Total GST</TH></TR></THead>
                <TBody><TR className="text-xs"><TD className="font-semibold">{gstRate}%</TD><TD className="text-right">{formatInr(calculation.taxableBase)}</TD><TD className="text-right">{formatInr(calculation.cgst)}</TD><TD className="text-right">{formatInr(calculation.sgst)}</TD><TD className="text-right font-bold">{formatInr(calculation.totalGst)}</TD></TR></TBody>
              </Table>
            </div>
            <div className="space-y-1"><Label className="text-xs font-semibold">Notes</Label><Input placeholder="Additional notes..." value={notes} onChange={e => setNotes(e.target.value)} /></div>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-orange-300 bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader className="pb-3 border-b border-orange-100 bg-orange-50/60"><CardTitle className="text-base font-semibold text-orange-950">4. Bill Summary</CardTitle></CardHeader>
          <CardContent className="pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>Gross Amount:</span><span className="font-medium text-foreground">{formatInr(calculation.grossAmount)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Discount:</span><span>- {formatInr(discount)}</span></div>
            <div className="flex justify-between text-muted-foreground border-t border-border/60 pt-1.5"><span>Taxable Value:</span><span className="font-semibold text-foreground">{formatInr(calculation.taxableBase)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>CGST ({gstRate/2}%):</span><span>{formatInr(calculation.cgst)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>SGST ({gstRate/2}%):</span><span>{formatInr(calculation.sgst)}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Round Off:</span><span>{formatInr(calculation.roundOff)}</span></div>
            <div className="flex justify-between border-t-2 border-orange-600 pt-2 text-lg font-bold bg-orange-100/60 p-2.5 rounded-md text-orange-950"><span>Bill Amount:</span><span className="text-orange-900">{formatInr(calculation.billAmount)}</span></div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-border">
        <Button variant="outline" size="lg" onClick={() => navigate("/admin/invoices")}>Cancel</Button>
        <Button size="lg" onClick={handleSave} disabled={!isFarmerReady || !items.length || saveMutation.isPending} className="bg-orange-700 hover:bg-orange-800 text-white font-semibold px-8">
          {saveMutation.isPending ? "Generating..." : "Generate Bill"}
        </Button>
      </div>
    </div>
  );
}

import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatInr } from "@/lib/utils";

interface Customer {
  id: string; fullName: string; mobile: string; address?: string | null; village?: string | null;
  taluka?: string | null; district?: string | null; surveyNumber?: string | null; landArea?: number | null;
}
interface Product { id: string; name: string; unit: string; sellingRate: number; governmentRate?: number | null; gstRate: number }
interface Scheme { id: string; schemeName: string; financialYear: string }

interface ItemRow {
  productId?: string;
  description: string;
  quantity: number;
  unit: string;
  sellingRate: number;
  governmentRate?: number | null;
  gstRate: number;
}

export default function QuotationBuilderPage() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [customerSearch, setCustomerSearch] = useState("");
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [schemeId, setSchemeId] = useState("");
  const [isSubsidyBased, setIsSubsidyBased] = useState(false);
  const [subsidyPercentage, setSubsidyPercentage] = useState<number | "">("");
  const [landArea, setLandArea] = useState<number | "">("");
  const [fileExpense, setFileExpense] = useState(0);
  const [otherCharges, setOtherCharges] = useState(0);
  const [gstRate, setGstRate] = useState(18);
  const [items, setItems] = useState<ItemRow[]>([]);
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
  const { data: schemes } = useQuery({ queryKey: ["schemes"], queryFn: () => api.get<Scheme[]>("/government-rates/schemes") });
  const { data: existing } = useQuery({
    queryKey: ["quotation", id],
    queryFn: () => api.get<any>(`/quotations/${id}`),
    enabled: isEdit,
  });

  useEffect(() => {
    if (!existing) return;
    setCustomer(existing.customer);
    setSchemeId(existing.schemeId ?? "");
    setIsSubsidyBased(existing.isSubsidyBased);
    setSubsidyPercentage(existing.subsidyPercentage ? Number(existing.subsidyPercentage) : "");
    setLandArea(existing.landArea ? Number(existing.landArea) : "");
    setFileExpense(Number(existing.fileExpense));
    setOtherCharges(Number(existing.otherCharges));
    setGstRate(Number(existing.gstRate));
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
    setCustomer(c);
    setCustomerSearch("");
    if (c.landArea) setLandArea(Number(c.landArea));
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
        gstRate: Number(p.gstRate),
      },
    ]);
    setProductSearch("");
  }

  function addBlankItem() {
    setItems((prev) => [...prev, { description: "", quantity: 1, unit: "Nos", sellingRate: 0, gstRate }]);
  }

  function updateItem(idx: number, patch: Partial<ItemRow>) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  // Live client-side preview only — backend recalculates authoritatively on save.
  const preview = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + it.quantity * it.sellingRate, 0);
    const taxable = subtotal + fileExpense + otherCharges;
    const gstAmount = Math.round(taxable * (gstRate / 100) * 100) / 100;
    const total = Math.round((taxable + gstAmount) * 100) / 100;

    let subsidyAmount = 0;
    let farmerContribution = total;
    if (isSubsidyBased && subsidyPercentage) {
      subsidyAmount = Math.round(subtotal * (Number(subsidyPercentage) / 100) * 100) / 100;
      farmerContribution = Math.round((total - subsidyAmount) * 100) / 100;
    }
    return { subtotal, gstAmount, total, subsidyAmount, farmerContribution };
  }, [items, fileExpense, otherCharges, gstRate, isSubsidyBased, subsidyPercentage]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) => (isEdit ? api.put(`/quotations/${id}`, payload) : api.post("/quotations", payload)),
    onSuccess: (data: any) => navigate(`/quotations/${data.id}`),
  });

  function buildPayload() {
    if (!customer) return null;
    return {
      customerId: customer.id,
      schemeId: schemeId || null,
      isSubsidyBased,
      subsidyPercentage: subsidyPercentage === "" ? null : Number(subsidyPercentage),
      landArea: landArea === "" ? null : Number(landArea),
      fileExpense,
      otherCharges,
      gstRate,
      items: items.map((it) => ({
        productId: it.productId ?? null,
        description: it.description,
        quantity: it.quantity,
        unit: it.unit,
        governmentRate: it.governmentRate ?? null,
        sellingRate: it.sellingRate,
        gstRate: it.gstRate,
      })),
    };
  }

  function handleSave() {
    const payload = buildPayload();
    if (!payload || !payload.items.length) return;
    saveMutation.mutate(payload);
  }

  return (
    <div className="space-y-4 pb-10">
      <h1 className="text-xl font-semibold">{isEdit ? "Edit Quotation" : t("newQuotation")}</h1>

      <Card>
        <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {customer ? (
            <div className="flex items-start justify-between rounded-md border border-border p-3 text-sm">
              <div>
                <p className="font-medium">{customer.fullName}</p>
                <p className="text-muted-foreground">{customer.mobile} · {customer.village ?? "-"}, {customer.district ?? "-"}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setCustomer(null)}>Change</Button>
            </div>
          ) : (
            <div className="relative max-w-md">
              <Input placeholder="Search customer by name / mobile..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} />
              {customerResults && customerResults.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md">
                  {customerResults.map((c) => (
                    <button key={c.id} type="button" onClick={() => selectCustomer(c)} className="block w-full px-3 py-2 text-left text-sm hover:bg-muted">
                      {c.fullName} — {c.mobile} {c.village ? `· ${c.village}` : ""}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="space-y-1">
              <Label>Scheme</Label>
              <select className="flex h-9 w-full rounded-md border border-border bg-background px-2 text-sm" value={schemeId} onChange={(e) => setSchemeId(e.target.value)}>
                <option value="">None</option>
                {schemes?.map((s) => <option key={s.id} value={s.id}>{s.schemeName} ({s.financialYear})</option>)}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={isSubsidyBased} onChange={(e) => setIsSubsidyBased(e.target.checked)} />
                Subsidy-based
              </label>
            </div>
            <div className="space-y-1">
              <Label>{t("subsidyPercent")}</Label>
              <Input type="number" step="0.01" value={subsidyPercentage} onChange={(e) => setSubsidyPercentage(e.target.value === "" ? "" : Number(e.target.value))} disabled={!isSubsidyBased} />
            </div>
            <div className="space-y-1">
              <Label>{t("landArea")}</Label>
              <Input type="number" step="0.01" value={landArea} onChange={(e) => setLandArea(e.target.value === "" ? "" : Number(e.target.value))} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="relative max-w-md">
            <Input placeholder="Search product to add..." value={productSearch} onChange={(e) => setProductSearch(e.target.value)} />
            {productResults && productResults.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-md border border-border bg-background shadow-md">
                {productResults.map((p) => (
                  <button key={p.id} type="button" onClick={() => addProduct(p)} className="block w-full px-3 py-2 text-left text-sm hover:bg-muted">
                    {p.name} — {formatInr(p.sellingRate)}/{p.unit}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Table>
            <THead>
              <TR><TH>Description</TH><TH>{t("quantity")}</TH><TH>{t("unit")}</TH><TH>{t("rate")}</TH><TH>{t("amount")}</TH><TH></TH></TR>
            </THead>
            <TBody>
              {items.map((it, idx) => (
                <TR key={idx}>
                  <TD><Input value={it.description} onChange={(e) => updateItem(idx, { description: e.target.value })} /></TD>
                  <TD><Input type="number" step="0.001" className="w-24" value={it.quantity} onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })} /></TD>
                  <TD><Input className="w-20" value={it.unit} onChange={(e) => updateItem(idx, { unit: e.target.value })} /></TD>
                  <TD><Input type="number" step="0.01" className="w-28" value={it.sellingRate} onChange={(e) => updateItem(idx, { sellingRate: Number(e.target.value) })} /></TD>
                  <TD>{formatInr(it.quantity * it.sellingRate)}</TD>
                  <TD><Button variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 size={14} /></Button></TD>
                </TR>
              ))}
            </TBody>
          </Table>
          <Button variant="outline" size="sm" onClick={addBlankItem}><Plus size={14} /> {t("addItem")}</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Charges & Totals (preview — recalculated on save)</CardTitle></CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div className="space-y-1"><Label>File Expense</Label><Input type="number" step="0.01" value={fileExpense} onChange={(e) => setFileExpense(Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>Other Charges</Label><Input type="number" step="0.01" value={otherCharges} onChange={(e) => setOtherCharges(Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>{t("gst")} %</Label><Input type="number" step="0.01" value={gstRate} onChange={(e) => setGstRate(Number(e.target.value))} /></div>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between"><span>{t("subtotal")}</span><span>{formatInr(preview.subtotal)}</span></div>
            <div className="flex justify-between"><span>{t("gst")}</span><span>{formatInr(preview.gstAmount)}</span></div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold"><span>{t("grandTotal")}</span><span>{formatInr(preview.total)}</span></div>
            {isSubsidyBased && (
              <>
                <div className="flex justify-between text-green-700"><span>{t("governmentContribution")}</span><span>{formatInr(preview.subsidyAmount)}</span></div>
                <div className="flex justify-between font-medium"><span>{t("farmerContribution")}</span><span>{formatInr(preview.farmerContribution)}</span></div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => navigate(-1)}>{t("cancel")}</Button>
        <Button onClick={handleSave} disabled={!customer || !items.length || saveMutation.isPending}>{t("saveDraft")}</Button>
      </div>
    </div>
  );
}

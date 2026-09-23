import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ShopSettings {
  shopName: string; address?: string | null; mobile?: string | null; email?: string | null;
  gstin?: string | null; district?: string | null; upiId?: string | null; bankName?: string | null;
  bankAccountNumber?: string | null; bankIfsc?: string | null; invoicePrefix: string; quotationPrefix: string;
  defaultGstRate: number; defaultSubsidyPct?: number | null; footerText?: string | null; termsAndConditions?: string | null;
}

const empty: ShopSettings = {
  shopName: "", invoicePrefix: "INV", quotationPrefix: "QTN", defaultGstRate: 18,
};

export default function SettingsPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["shop-settings"], queryFn: () => api.get<ShopSettings | null>("/settings/shop") });
  const [form, setForm] = useState<ShopSettings>(empty);

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () => api.put("/settings/shop", form),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["shop-settings"] }),
  });

  function set<K extends keyof ShopSettings>(key: K, value: ShopSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-xl font-semibold">{t("settings")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="space-y-4"
      >
        <Card>
          <CardHeader><CardTitle>Shop Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="col-span-2 space-y-1"><Label>Shop Name *</Label><Input value={form.shopName} onChange={(e) => set("shopName", e.target.value)} required /></div>
            <div className="col-span-2 space-y-1"><Label>{t("address")}</Label><Input value={form.address ?? ""} onChange={(e) => set("address", e.target.value)} /></div>
            <div className="space-y-1"><Label>{t("mobile")}</Label><Input value={form.mobile ?? ""} onChange={(e) => set("mobile", e.target.value)} /></div>
            <div className="space-y-1"><Label>Email</Label><Input value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></div>
            <div className="space-y-1"><Label>GSTIN</Label><Input value={form.gstin ?? ""} onChange={(e) => set("gstin", e.target.value)} /></div>
            <div className="space-y-1"><Label>{t("district")}</Label><Input value={form.district ?? ""} onChange={(e) => set("district", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Payment Details</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1"><Label>UPI ID</Label><Input value={form.upiId ?? ""} onChange={(e) => set("upiId", e.target.value)} /></div>
            <div className="space-y-1"><Label>Bank Name</Label><Input value={form.bankName ?? ""} onChange={(e) => set("bankName", e.target.value)} /></div>
            <div className="space-y-1"><Label>Account Number</Label><Input value={form.bankAccountNumber ?? ""} onChange={(e) => set("bankAccountNumber", e.target.value)} /></div>
            <div className="space-y-1"><Label>IFSC</Label><Input value={form.bankIfsc ?? ""} onChange={(e) => set("bankIfsc", e.target.value)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Numbering & Defaults</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1"><Label>Quotation Prefix</Label><Input value={form.quotationPrefix} onChange={(e) => set("quotationPrefix", e.target.value)} /></div>
            <div className="space-y-1"><Label>Invoice Prefix</Label><Input value={form.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} /></div>
            <div className="space-y-1"><Label>Default GST %</Label><Input type="number" step="0.01" value={form.defaultGstRate} onChange={(e) => set("defaultGstRate", Number(e.target.value))} /></div>
            <div className="space-y-1"><Label>Default Subsidy %</Label><Input type="number" step="0.01" value={form.defaultSubsidyPct ?? ""} onChange={(e) => set("defaultSubsidyPct", e.target.value ? Number(e.target.value) : null)} /></div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>PDF Footer & Terms</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1"><Label>Footer Text</Label><Input value={form.footerText ?? ""} onChange={(e) => set("footerText", e.target.value)} /></div>
            <div className="space-y-1"><Label>Terms & Conditions</Label><Input value={form.termsAndConditions ?? ""} onChange={(e) => set("termsAndConditions", e.target.value)} /></div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>{t("save")}</Button>
        </div>
      </form>
    </div>
  );
}

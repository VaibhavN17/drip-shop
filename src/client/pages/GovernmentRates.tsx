import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";

interface Scheme { id: string; schemeName: string; financialYear: string; component?: string | null; isActive: boolean }
interface Rate {
  id: string; unit: string; governmentRate: number; maximumEligibleQuantity?: number | null;
  subsidyPercentage: number; effectiveFrom: string; isActive: boolean; scheme: Scheme;
}

export default function GovernmentRatesPage() {
  const { t } = useI18n();
  const qc = useQueryClient();
  const [schemeOpen, setSchemeOpen] = useState(false);
  const [rateOpen, setRateOpen] = useState(false);

  const { data: schemes } = useQuery({ queryKey: ["schemes"], queryFn: () => api.get<Scheme[]>("/government-rates/schemes") });
  const { data: rates } = useQuery({ queryKey: ["rates"], queryFn: () => api.get<Rate[]>("/government-rates") });

  const [schemeForm, setSchemeForm] = useState({ schemeName: "", financialYear: "", component: "" });
  const createScheme = useMutation({
    mutationFn: () => api.post("/government-rates/schemes", schemeForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["schemes"] });
      setSchemeOpen(false);
      setSchemeForm({ schemeName: "", financialYear: "", component: "" });
    },
  });

  const [rateForm, setRateForm] = useState({
    schemeId: "", unit: "Mtr", governmentRate: "", maximumEligibleQuantity: "", subsidyPercentage: "", effectiveFrom: "",
  });
  const createRate = useMutation({
    mutationFn: () =>
      api.post("/government-rates", {
        schemeId: rateForm.schemeId,
        unit: rateForm.unit,
        governmentRate: Number(rateForm.governmentRate),
        maximumEligibleQuantity: rateForm.maximumEligibleQuantity ? Number(rateForm.maximumEligibleQuantity) : null,
        subsidyPercentage: Number(rateForm.subsidyPercentage),
        effectiveFrom: rateForm.effectiveFrom,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["rates"] });
      setRateOpen(false);
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("governmentRates")}</h1>
        <div className="flex gap-2">
          <Dialog open={schemeOpen} onOpenChange={setSchemeOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm"><Plus size={14} /> New Scheme</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Government Scheme</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createScheme.mutate(); }} className="space-y-3">
                <div className="space-y-1"><Label>Scheme Name</Label><Input value={schemeForm.schemeName} onChange={(e) => setSchemeForm((s) => ({ ...s, schemeName: e.target.value }))} required /></div>
                <div className="space-y-1"><Label>Financial Year (e.g. 2026-27)</Label><Input value={schemeForm.financialYear} onChange={(e) => setSchemeForm((s) => ({ ...s, financialYear: e.target.value }))} required /></div>
                <div className="space-y-1"><Label>Component</Label><Input value={schemeForm.component} onChange={(e) => setSchemeForm((s) => ({ ...s, component: e.target.value }))} /></div>
                <div className="flex justify-end gap-2"><Button type="submit">{t("save")}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={rateOpen} onOpenChange={setRateOpen}>
            <DialogTrigger asChild><Button size="sm"><Plus size={14} /> New Rate</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>New Government Rate</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); createRate.mutate(); }} className="space-y-3">
                <div className="space-y-1">
                  <Label>Scheme</Label>
                  <select className="flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm" value={rateForm.schemeId} onChange={(e) => setRateForm((s) => ({ ...s, schemeId: e.target.value }))} required>
                    <option value="">Select...</option>
                    {schemes?.map((s) => <option key={s.id} value={s.id}>{s.schemeName} ({s.financialYear})</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1"><Label>Unit</Label><Input value={rateForm.unit} onChange={(e) => setRateForm((s) => ({ ...s, unit: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Govt Rate</Label><Input type="number" step="0.01" value={rateForm.governmentRate} onChange={(e) => setRateForm((s) => ({ ...s, governmentRate: e.target.value }))} required /></div>
                  <div className="space-y-1"><Label>Max Eligible Qty</Label><Input type="number" step="0.01" value={rateForm.maximumEligibleQuantity} onChange={(e) => setRateForm((s) => ({ ...s, maximumEligibleQuantity: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Subsidy %</Label><Input type="number" step="0.01" value={rateForm.subsidyPercentage} onChange={(e) => setRateForm((s) => ({ ...s, subsidyPercentage: e.target.value }))} required /></div>
                  <div className="col-span-2 space-y-1"><Label>Effective From</Label><Input type="date" value={rateForm.effectiveFrom} onChange={(e) => setRateForm((s) => ({ ...s, effectiveFrom: e.target.value }))} required /></div>
                </div>
                <div className="flex justify-end gap-2"><Button type="submit">{t("save")}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Table>
        <THead><TR><TH>Scheme</TH><TH>Year</TH><TH>Unit</TH><TH>Govt Rate</TH><TH>Max Qty</TH><TH>Subsidy %</TH><TH>Effective From</TH></TR></THead>
        <TBody>
          {rates?.map((r) => (
            <TR key={r.id}>
              <TD>{r.scheme.schemeName}</TD>
              <TD>{r.scheme.financialYear}</TD>
              <TD>{r.unit}</TD>
              <TD>{formatInr(r.governmentRate)}</TD>
              <TD>{r.maximumEligibleQuantity ?? "Unlimited"}</TD>
              <TD>{Number(r.subsidyPercentage)}%</TD>
              <TD>{formatDate(r.effectiveFrom)}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {!rates?.length && <p className="text-sm text-muted-foreground">No government rates configured yet.</p>}
    </div>
  );
}

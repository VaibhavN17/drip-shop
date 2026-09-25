import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileDown, Printer, Share2, Plus } from "lucide-react";
import { api, getAccessToken, ApiClientError } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatInr, formatDate } from "@/lib/utils";

interface InvoiceDetail {
  id: string; invoiceNumber: string; invoiceDate: string; subtotal: number; cgst: number; sgst: number;
  igst: number; gstAmount: number; discount: number; roundOff: number; totalAmount: number;
  paidAmount: number; balanceAmount: number; paymentStatus: string; isInterstate: boolean;
  customer: { id: string; fullName: string; mobile: string };
  items: Array<{ id: string; description: string; hsnCode?: string | null; quantity: number; unit: string; rate: number; taxableValue: number; totalAmount: number }>;
  payments: Array<{ id: string; amount: number; paymentDate: string; paymentMethod: string; referenceNumber?: string | null }>;
}

const PAYMENT_METHODS = ["CASH", "UPI", "BANK_TRANSFER", "CARD", "OTHER"];

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("CASH");
  const [reference, setReference] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({
    queryKey: ["invoice", id],
    queryFn: () => api.get<InvoiceDetail>(`/invoices/${id}`),
    enabled: !!id,
  });

  const paymentMutation = useMutation({
    mutationFn: () => api.post(`/invoices/${id}/payments`, { amount: Number(amount), paymentMethod: method, referenceNumber: reference || null }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["invoice", id] });
      setOpen(false);
      setAmount("");
      setReference("");
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiClientError ? err.message : "Failed to record payment"),
  });

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  const pdfUrl = `/api/pdf/invoices/${id}`;
  async function openPdf() {
    const res = await fetch(pdfUrl, { headers: { Authorization: `Bearer ${getAccessToken()}` } });
    const blob = await res.blob();
    window.open(URL.createObjectURL(blob), "_blank");
  }
  function shareOnWhatsApp() {
    if (!data) return;
    const message = `Invoice ${data.invoiceNumber} for ${data.customer.fullName} — Total: ${formatInr(data.totalAmount)}, Balance: ${formatInr(data.balanceAmount)}.`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{data.invoiceNumber}</h1>
          <Link to={`/admin/customers/${data.customer.id}`} className="text-sm text-primary hover:underline">{data.customer.fullName} · {data.customer.mobile}</Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={openPdf}><FileDown size={14} /> {t("downloadPdf")}</Button>
          <Button variant="outline" size="sm" onClick={openPdf}><Printer size={14} /> {t("print")}</Button>
          <Button variant="outline" size="sm" onClick={shareOnWhatsApp}><Share2 size={14} /> {t("shareWhatsApp")}</Button>
          {data.balanceAmount > 0 && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button size="sm"><Plus size={14} /> {t("recordPayment")}</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>{t("recordPayment")}</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); paymentMutation.mutate(); }} className="space-y-3">
                  <p className="text-sm text-muted-foreground">Outstanding balance: {formatInr(data.balanceAmount)}</p>
                  <div className="space-y-1">
                    <Label>Amount</Label>
                    <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required max={data.balanceAmount} />
                  </div>
                  <div className="space-y-1">
                    <Label>Method</Label>
                    <Select value={method} onChange={(e) => setMethod(e.target.value)} options={PAYMENT_METHODS.map((m) => ({ value: m, label: m }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Reference Number</Label>
                    <Input value={reference} onChange={(e) => setReference(e.target.value)} />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
                    <Button type="submit" disabled={paymentMutation.isPending}>{t("save")}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge status={data.paymentStatus}>{data.paymentStatus}</Badge>
        <span className="text-sm text-muted-foreground">{formatDate(data.invoiceDate)}</span>
      </div>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <THead><TR><TH>Description</TH><TH>HSN</TH><TH>{t("quantity")}</TH><TH>{t("unit")}</TH><TH>{t("rate")}</TH><TH>Taxable</TH><TH>Total</TH></TR></THead>
            <TBody>
              {data.items.map((it) => (
                <TR key={it.id}>
                  <TD>{it.description}</TD>
                  <TD>{it.hsnCode ?? "-"}</TD>
                  <TD>{Number(it.quantity)}</TD>
                  <TD>{it.unit}</TD>
                  <TD>{formatInr(it.rate)}</TD>
                  <TD>{formatInr(it.taxableValue)}</TD>
                  <TD>{formatInr(it.totalAmount)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <div className="flex justify-between"><span>{t("subtotal")}</span><span>{formatInr(data.subtotal)}</span></div>
            <div className="flex justify-between"><span>CGST</span><span>{formatInr(data.cgst)}</span></div>
            <div className="flex justify-between"><span>SGST</span><span>{formatInr(data.sgst)}</span></div>
            {data.isInterstate && <div className="flex justify-between"><span>IGST</span><span>{formatInr(data.igst)}</span></div>}
            <div className="flex justify-between"><span>Discount</span><span>{formatInr(data.discount)}</span></div>
            <div className="flex justify-between"><span>Round Off</span><span>{formatInr(data.roundOff)}</span></div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold"><span>{t("grandTotal")}</span><span>{formatInr(data.totalAmount)}</span></div>
            <div className="flex justify-between text-green-700"><span>Paid</span><span>{formatInr(data.paidAmount)}</span></div>
            <div className="flex justify-between font-semibold"><span>{t("outstanding")}</span><span>{formatInr(data.balanceAmount)}</span></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{t("payments")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.payments.map((p) => (
              <div key={p.id} className="flex justify-between text-sm">
                <span>{formatDate(p.paymentDate)} · {p.paymentMethod} {p.referenceNumber ? `(${p.referenceNumber})` : ""}</span>
                <span className="font-medium">{formatInr(p.amount)}</span>
              </div>
            ))}
            {!data.payments.length && <p className="text-sm text-muted-foreground">No payments recorded yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

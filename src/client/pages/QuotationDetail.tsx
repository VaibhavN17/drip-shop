import React from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FileDown, Printer, Copy, ArrowRightCircle, Share2 } from "lucide-react";
import { api, getAccessToken } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { formatInr, formatDate } from "@/lib/utils";

interface QuotationDetail {
  id: string; quotationNumber: string; status: string; quotationDate: string; totalAmount: number;
  subtotal: number; fileExpense: number; otherCharges: number; gstRate: number; gstAmount: number;
  isSubsidyBased: boolean; subsidyPercentage?: number | null; eligibleAmount?: number | null;
  subsidyAmount?: number | null; farmerContribution?: number | null;
  customer: { id: string; fullName: string; mobile: string };
  items: Array<{ id: string; description: string; quantity: number; unit: string; sellingRate: number; amount: number }>;
}

const STATUS_OPTIONS = ["DRAFT", "SENT", "APPROVED", "REJECTED", "EXPIRED", "CONVERTED"];

export default function QuotationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["quotation", id],
    queryFn: () => api.get<QuotationDetail>(`/quotations/${id}`),
    enabled: !!id,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => api.patch(`/quotations/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["quotation", id] }),
  });

  const duplicateMutation = useMutation({
    mutationFn: () => api.post<{ id: string }>(`/quotations/${id}/duplicate`),
    onSuccess: (res) => navigate(`/quotations/${res.id}`),
  });

  const convertMutation = useMutation({
    mutationFn: () => api.post<{ id: string }>(`/quotations/${id}/convert-to-invoice`, { isInterstate: false }),
    onSuccess: (res) => navigate(`/invoices/${res.id}`),
  });

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  const pdfUrl = `/api/pdf/quotations/${id}`;

  async function openPdf() {
    const res = await fetch(pdfUrl, { headers: { Authorization: `Bearer ${getAccessToken()}` } });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  function shareOnWhatsApp() {
    const message = `Quotation ${data.quotationNumber} for ${data.customer.fullName} — Total: ${formatInr(data.totalAmount)}. Please find the PDF attached (downloaded separately).`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-semibold">{data.quotationNumber}</h1>
          <Link to={`/customers/${data.customer.id}`} className="text-sm text-primary hover:underline">{data.customer.fullName} · {data.customer.mobile}</Link>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select
            className="w-36"
            value={data.status}
            onChange={(e) => statusMutation.mutate(e.target.value)}
            options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
          />
          <Button variant="outline" size="sm" onClick={openPdf}><FileDown size={14} /> {t("downloadPdf")}</Button>
          <Button variant="outline" size="sm" onClick={openPdf}><Printer size={14} /> {t("print")}</Button>
          <Button variant="outline" size="sm" onClick={shareOnWhatsApp}><Share2 size={14} /> {t("shareWhatsApp")}</Button>
          <Button variant="outline" size="sm" onClick={() => duplicateMutation.mutate()}><Copy size={14} /> {t("duplicateQuotation")}</Button>
          {data.status !== "CONVERTED" && (
            <Button size="sm" onClick={() => convertMutation.mutate()}><ArrowRightCircle size={14} /> {t("convertToInvoice")}</Button>
          )}
          {data.status !== "CONVERTED" && (
            <Link to={`/quotations/${id}/edit`}><Button variant="outline" size="sm">{t("edit")}</Button></Link>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Badge status={data.status}>{data.status}</Badge>
        <span className="text-sm text-muted-foreground">{formatDate(data.quotationDate)}</span>
      </div>

      <Card>
        <CardHeader><CardTitle>Items</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <THead><TR><TH>Description</TH><TH>{t("quantity")}</TH><TH>{t("unit")}</TH><TH>{t("rate")}</TH><TH>{t("amount")}</TH></TR></THead>
            <TBody>
              {data.items.map((it) => (
                <TR key={it.id}>
                  <TD>{it.description}</TD>
                  <TD>{Number(it.quantity)}</TD>
                  <TD>{it.unit}</TD>
                  <TD>{formatInr(it.sellingRate)}</TD>
                  <TD>{formatInr(it.amount)}</TD>
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
            <div className="flex justify-between"><span>File Expense</span><span>{formatInr(data.fileExpense)}</span></div>
            <div className="flex justify-between"><span>Other Charges</span><span>{formatInr(data.otherCharges)}</span></div>
            <div className="flex justify-between"><span>{t("gst")} ({Number(data.gstRate)}%)</span><span>{formatInr(data.gstAmount)}</span></div>
            <div className="flex justify-between border-t border-border pt-1 font-semibold"><span>{t("grandTotal")}</span><span>{formatInr(data.totalAmount)}</span></div>
          </CardContent>
        </Card>
        {data.isSubsidyBased && (
          <Card>
            <CardHeader><CardTitle>Subsidy</CardTitle></CardHeader>
            <CardContent className="space-y-1 text-sm">
              <div className="flex justify-between"><span>{t("subsidyPercent")}</span><span>{Number(data.subsidyPercentage ?? 0)}%</span></div>
              <div className="flex justify-between"><span>{t("eligibleAmount")}</span><span>{formatInr(data.eligibleAmount)}</span></div>
              <div className="flex justify-between text-green-700"><span>{t("governmentContribution")}</span><span>{formatInr(data.subsidyAmount)}</span></div>
              <div className="flex justify-between font-semibold"><span>{t("farmerContribution")}</span><span>{formatInr(data.farmerContribution)}</span></div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

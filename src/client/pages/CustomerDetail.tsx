import React from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";

interface CustomerDetail {
  id: string;
  customerCode: string;
  fullName: string;
  mobile: string;
  village?: string | null;
  district?: string | null;
  address?: string | null;
  surveyNumber?: string | null;
  landArea?: number | null;
  quotations: Array<{ id: string; quotationNumber: string; totalAmount: number; status: string; createdAt: string }>;
  invoices: Array<{ id: string; invoiceNumber: string; totalAmount: number; paymentStatus: string; createdAt: string; balanceAmount: number }>;
  summary: { totalPurchases: number; outstanding: number };
}

export default function CustomerDetailPage() {
  const { id } = useParams();
  const { data } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => api.get<CustomerDetail>(`/customers/${id}`),
    enabled: !!id,
  });

  if (!data) return <div className="text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{data.fullName}</h1>
        <p className="text-sm text-muted-foreground">{data.customerCode} · {data.mobile}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader><CardTitle>Total Purchases</CardTitle></CardHeader>
          <CardContent className="text-lg font-bold">{formatInr(data.summary.totalPurchases)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Outstanding</CardTitle></CardHeader>
          <CardContent className="text-lg font-bold">{formatInr(data.summary.outstanding)}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Village / District</CardTitle></CardHeader>
          <CardContent className="text-sm">{data.village ?? "-"} / {data.district ?? "-"}</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Survey / Land Area</CardTitle></CardHeader>
          <CardContent className="text-sm">{data.surveyNumber ?? "-"} {data.landArea ? `· ${data.landArea} acre` : ""}</CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Quotation History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.quotations.map((q) => (
              <Link key={q.id} to={`/admin/quotations/${q.id}`} className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
                <span>{q.quotationNumber} · {formatDate(q.createdAt)}</span>
                <span className="flex items-center gap-2">{formatInr(q.totalAmount)}<Badge status={q.status}>{q.status}</Badge></span>
              </Link>
            ))}
            {!data.quotations.length && <p className="text-sm text-muted-foreground">No quotations yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Invoice & Payment History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.invoices.map((inv) => (
              <Link key={inv.id} to={`/admin/invoices/${inv.id}`} className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
                <span>{inv.invoiceNumber} · {formatDate(inv.createdAt)}</span>
                <span className="flex items-center gap-2">
                  {formatInr(inv.totalAmount)}
                  <Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge>
                </span>
              </Link>
            ))}
            {!data.invoices.length && <p className="text-sm text-muted-foreground">No invoices yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

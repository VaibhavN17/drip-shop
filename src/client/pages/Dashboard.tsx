import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface DashboardData {
  totalCustomers: number;
  totalQuotations: number;
  totalInvoices: number;
  totalProducts: number;
  todaySales: number;
  monthSales: number;
  pendingPayments: number;
  recentQuotations: Array<{ id: string; quotationNumber: string; totalAmount: number; status: string; customer: { fullName: string } }>;
  recentInvoices: Array<{ id: string; invoiceNumber: string; totalAmount: number; paymentStatus: string; customer: { fullName: string } }>;
}

export default function DashboardPage() {
  const { t } = useI18n();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/reports/dashboard"),
  });

  if (isLoading || !data) return <div className="text-muted-foreground">Loading dashboard...</div>;

  const cards = [
    { label: t("customers"), value: data.totalCustomers },
    { label: t("quotations"), value: data.totalQuotations },
    { label: t("invoices"), value: data.totalInvoices },
    { label: "Products", value: data.totalProducts },
    { label: t("todaySales"), value: formatInr(data.todaySales) },
    { label: t("pendingPayments"), value: formatInr(data.pendingPayments) },
  ];

  const chartData = [
    { name: "Today", value: data.todaySales },
    { name: "This Month", value: data.monthSales },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">{t("dashboard")}</h1>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="pb-1">
              <CardTitle>{c.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("monthSales")}</CardTitle>
        </CardHeader>
        <CardContent className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip formatter={(v: number) => formatInr(v)} />
              <Bar dataKey="value" fill="hsl(142 71% 29%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("recentQuotations")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentQuotations.map((q) => (
              <Link key={q.id} to={`/admin/quotations/${q.id}`} className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
                <span>{q.quotationNumber} — {q.customer.fullName}</span>
                <span className="flex items-center gap-2">
                  {formatInr(q.totalAmount)}
                  <Badge status={q.status}>{q.status}</Badge>
                </span>
              </Link>
            ))}
            {!data.recentQuotations.length && <p className="text-sm text-muted-foreground">No quotations yet.</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t("recentInvoices")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {data.recentInvoices.map((inv) => (
              <Link key={inv.id} to={`/admin/invoices/${inv.id}`} className="flex items-center justify-between rounded-md p-2 text-sm hover:bg-muted">
                <span>{inv.invoiceNumber} — {inv.customer.fullName}</span>
                <span className="flex items-center gap-2">
                  {formatInr(inv.totalAmount)}
                  <Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge>
                </span>
              </Link>
            ))}
            {!data.recentInvoices.length && <p className="text-sm text-muted-foreground">No invoices yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

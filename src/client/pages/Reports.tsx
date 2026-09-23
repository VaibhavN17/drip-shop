import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatInr } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Download } from "lucide-react";

interface SalesReport { total: number; byDay: Array<{ date: string; amount: number }> }
interface CustomerPurchase {
  customer: { fullName: string; mobile: string };
  invoiceCount: number;
  totalPurchases: number;
  outstanding: number;
}

function toCsv(rows: CustomerPurchase[]): string {
  const header = "Customer,Mobile,Invoices,Total Purchases,Outstanding";
  const lines = rows.map(
    (r) => `${r.customer.fullName},${r.customer.mobile},${r.invoiceCount},${r.totalPurchases},${r.outstanding}`
  );
  return [header, ...lines].join("\n");
}

export default function ReportsPage() {
  const { t } = useI18n();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const { data: sales } = useQuery({
    queryKey: ["sales-report", from, to],
    queryFn: () => api.get<SalesReport>(`/reports/sales${from || to ? `?${from ? `from=${from}&` : ""}${to ? `to=${to}` : ""}` : ""}`),
  });
  const { data: customerPurchases } = useQuery({
    queryKey: ["customer-purchases"],
    queryFn: () => api.get<CustomerPurchase[]>("/reports/customers"),
  });

  function exportCsv() {
    if (!customerPurchases) return;
    const blob = new Blob([toCsv(customerPurchases)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-purchases.csv";
    a.click();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t("reports")}</h1>

      <Card>
        <CardHeader><CardTitle>Sales Over Time</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <div><Label>From</Label><Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} /></div>
            <div><Label>To</Label><Input type="date" value={to} onChange={(e) => setTo(e.target.value)} /></div>
          </div>
          <p className="text-sm text-muted-foreground">Total: {formatInr(sales?.total ?? 0)}</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sales?.byDay ?? []}>
                <XAxis dataKey="date" fontSize={10} />
                <YAxis fontSize={10} />
                <Tooltip formatter={(v: number) => formatInr(v)} />
                <Line type="monotone" dataKey="amount" stroke="hsl(142 71% 29%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Customer Purchases</CardTitle>
          <Button variant="outline" size="sm" onClick={exportCsv}><Download size={14} /> Export CSV</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <THead><TR><TH>Customer</TH><TH>Mobile</TH><TH>Invoices</TH><TH>Total</TH><TH>Outstanding</TH></TR></THead>
            <TBody>
              {customerPurchases?.map((r, idx) => (
                <TR key={idx}>
                  <TD>{r.customer.fullName}</TD>
                  <TD>{r.customer.mobile}</TD>
                  <TD>{r.invoiceCount}</TD>
                  <TD>{formatInr(r.totalPurchases)}</TD>
                  <TD>{formatInr(r.outstanding)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

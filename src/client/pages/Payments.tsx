import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";

interface OutstandingInvoice {
  id: string; invoiceNumber: string; totalAmount: number; paidAmount: number; balanceAmount: number;
  paymentStatus: string; invoiceDate: string; customer: { fullName: string; mobile: string };
}

export default function PaymentsPage() {
  const { t } = useI18n();
  const { data } = useQuery({
    queryKey: ["outstanding"],
    queryFn: () => api.get<OutstandingInvoice[]>("/reports/outstanding"),
  });

  const totalOutstanding = data?.reduce((sum, inv) => sum + Number(inv.balanceAmount), 0) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("payments")} — {t("outstanding")}</h1>
        <span className="text-lg font-bold">{formatInr(totalOutstanding)}</span>
      </div>

      <Table>
        <THead><TR><TH>Invoice</TH><TH>Customer</TH><TH>Date</TH><TH>Total</TH><TH>Paid</TH><TH>Balance</TH><TH>{t("paymentStatus")}</TH></TR></THead>
        <TBody>
          {data?.map((inv) => (
            <TR key={inv.id}>
              <TD><Link to={`/admin/invoices/${inv.id}`} className="font-medium text-primary hover:underline">{inv.invoiceNumber}</Link></TD>
              <TD>{inv.customer.fullName} · {inv.customer.mobile}</TD>
              <TD>{formatDate(inv.invoiceDate)}</TD>
              <TD>{formatInr(inv.totalAmount)}</TD>
              <TD>{formatInr(inv.paidAmount)}</TD>
              <TD className="font-medium">{formatInr(inv.balanceAmount)}</TD>
              <TD><Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge></TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {!data?.length && <p className="text-sm text-muted-foreground">No outstanding payments. 🎉</p>}
    </div>
  );
}

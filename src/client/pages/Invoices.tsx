import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";

interface Invoice {
  id: string; invoiceNumber: string; totalAmount: number; paidAmount: number; balanceAmount: number;
  paymentStatus: string; invoiceDate: string; customer: { fullName: string; mobile: string };
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
];

export default function InvoicesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data } = useQuery({
    queryKey: ["invoices", search, status],
    queryFn: () => api.get<Invoice[]>(`/invoices?search=${encodeURIComponent(search)}&paymentStatus=${status}&limit=50`),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t("invoices")}</h1>

      <div className="flex flex-wrap gap-2">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={`${t("search")}...`} className="pl-7" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-40" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS.slice(1)} placeholder="All statuses" />
      </div>

      <Table>
        <THead><TR><TH>Number</TH><TH>Customer</TH><TH>Date</TH><TH>Total</TH><TH>Balance</TH><TH>{t("paymentStatus")}</TH></TR></THead>
        <TBody>
          {data?.map((inv) => (
            <TR key={inv.id}>
              <TD><Link to={`/invoices/${inv.id}`} className="font-medium text-primary hover:underline">{inv.invoiceNumber}</Link></TD>
              <TD>{inv.customer.fullName} · {inv.customer.mobile}</TD>
              <TD>{formatDate(inv.invoiceDate)}</TD>
              <TD>{formatInr(inv.totalAmount)}</TD>
              <TD>{formatInr(inv.balanceAmount)}</TD>
              <TD><Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge></TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {!data?.length && <p className="text-sm text-muted-foreground">No invoices yet.</p>}
    </div>
  );
}

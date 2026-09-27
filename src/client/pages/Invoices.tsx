import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Plus, Droplets, ShoppingCart, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";

interface Invoice {
  id: string; invoiceNumber: string; totalAmount: number; paidAmount: number; balanceAmount: number;
  paymentStatus: string; invoiceDate: string; notes?: string | null;
  customer: { fullName: string; mobile: string };
}

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "UNPAID", label: "Unpaid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "PAID", label: "Paid" },
];

function getBillTypeBadge(notes?: string | null) {
  if (notes?.includes("मिनी स्प्रिंकलर"))
    return <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 font-medium"><Droplets size={10} /> Mini Sprinkler</span>;
  if (notes?.includes("रेग्युलर"))
    return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 text-xs px-2 py-0.5 font-medium"><ShoppingCart size={10} /> Regular</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 text-xs px-2 py-0.5 font-medium"><FileText size={10} /> Subsidy</span>;
}

export default function InvoicesPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data } = useQuery({
    queryKey: ["invoices", search, status],
    queryFn: () => api.get<Invoice[]>(`/invoices?search=${search}&paymentStatus=${status}&limit=50`),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-semibold">{t("invoices")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/invoices/new">
            <Button size="sm" className="bg-blue-700 hover:bg-blue-800 text-white gap-1.5">
              <Plus size={14} /><FileText size={13} /> तुषार / Subsidy Bill
            </Button>
          </Link>
          <Link to="/admin/invoices/new-mini-sprinkler">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5">
              <Plus size={14} /><Droplets size={13} /> मिनी स्प्रिंकलर Bill
            </Button>
          </Link>
          <Link to="/admin/invoices/new-regular">
            <Button size="sm" className="bg-orange-700 hover:bg-orange-800 text-white gap-1.5">
              <Plus size={14} /><ShoppingCart size={13} /> Regular Cash Bill
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder={`${t("search")}...`} className="pl-7" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select className="w-40" value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_OPTIONS.slice(1)} placeholder="All statuses" />
      </div>

      <Table>
        <THead><TR><TH>Number</TH><TH>Type</TH><TH>Customer</TH><TH>Date</TH><TH>Total</TH><TH>Balance</TH><TH>{t("paymentStatus")}</TH></TR></THead>
        <TBody>
          {data?.map((inv) => (
            <TR key={inv.id}>
              <TD><Link to={`/admin/invoices/${inv.id}`} className="font-medium text-primary hover:underline">{inv.invoiceNumber}</Link></TD>
              <TD>{getBillTypeBadge(inv.notes)}</TD>
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

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Plus, Search, Droplets, FileText } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";

interface Quotation {
  id: string; quotationNumber: string; totalAmount: number; status: string; createdAt: string;
  customer: { fullName: string; mobile: string };
}

export default function QuotationsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const { data } = useQuery({
    queryKey: ["quotations", search],
    queryFn: () => api.get<Quotation[]>(`/quotations?search=${encodeURIComponent(search)}&limit=50`),
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{t("quotations")}</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/quotations/new-mini-sprinkler">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white gap-1.5 shadow-xs">
              <Plus size={14} /><Droplets size={13} /> मिनी स्प्रिंकलर Quotation (1-Click 1 Acre)
            </Button>
          </Link>
          <Link to="/admin/quotations/new">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Plus size={14} /><FileText size={13} /> ठिबक / Standard Quotation
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={`${t("search")}...`} className="pl-7" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Table>
        <THead><TR><TH>Number</TH><TH>Customer</TH><TH>Date</TH><TH>Total</TH><TH>{t("status")}</TH></TR></THead>
        <TBody>
          {data?.map((q) => (
            <TR key={q.id}>
              <TD><Link to={`/admin/quotations/${q.id}`} className="font-medium text-primary hover:underline">{q.quotationNumber}</Link></TD>
              <TD>{q.customer.fullName} · {q.customer.mobile}</TD>
              <TD>{formatDate(q.createdAt)}</TD>
              <TD>{formatInr(q.totalAmount)}</TD>
              <TD><Badge status={q.status}>{q.status}</Badge></TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {!data?.length && <p className="text-sm text-muted-foreground">No quotations yet.</p>}
    </div>
  );
}

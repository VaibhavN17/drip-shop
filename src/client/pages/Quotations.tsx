import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Droplets,
  FileText,
  Phone,
  MessageCircle,
  ChevronRight,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";

interface Quotation {
  id: string;
  quotationNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  notes?: string | null;
  customer: { fullName: string; mobile: string; village?: string | null };
}

export default function QuotationsPage() {
  const { t, lang } = useI18n();
  const isMarathi = lang === "mr";
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["quotations", search],
    queryFn: () => api.get<Quotation[]>(`/quotations?search=${encodeURIComponent(search)}&limit=100`),
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header & Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("quotations")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isMarathi ? "शेतकऱ्यांसाठी अधिकृत कोटेशन्स व अंदाजपत्रके" : "Customer quotations and estimates"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mini Sprinkler Quotation 1-Click */}
          <Link to="/admin/quotations/new-mini-sprinkler">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-1.5 shadow-xs h-9">
              <Droplets size={14} />
              <span>⚡ मिनी स्प्रिंकलर (1-Click 1 Acre)</span>
            </Button>
          </Link>

          {/* Standard Quotation */}
          <Link to="/admin/quotations/new">
            <Button size="sm" variant="outline" className="border-border text-foreground gap-1.5 h-9">
              <FileText size={14} />
              <span>ठिबक / Standard</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={isMarathi ? "कोटेशन नं किंवा ग्राहकाचे नाव..." : "Search quotation or customer..."}
          className="pl-9 pr-8 h-10 bg-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground py-6 text-center">
          {isMarathi ? "कोटेशन्स लोड होत आहेत..." : "Loading quotations..."}
        </div>
      )}

      {/* MOBILE CARD VIEW (< md screens) */}
      <div className="grid gap-3 md:hidden">
        {data?.map((q) => {
          const cleanMobile = q.customer.mobile?.replace(/\D/g, "");
          return (
            <div
              key={q.id}
              className="rounded-xl border border-border bg-card p-3.5 shadow-2xs space-y-3"
            >
              {/* Header: Quotation Number and Date */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/admin/quotations/${q.id}`}
                    className="font-bold text-base text-teal-800 hover:underline flex items-center gap-1"
                  >
                    <span>{q.quotationNumber}</span>
                    <ChevronRight size={15} className="text-muted-foreground" />
                  </Link>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDate(q.createdAt)}
                  </div>
                </div>

                <Badge status={q.status}>{q.status}</Badge>
              </div>

              {/* Customer details with Call / WhatsApp */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                <div>
                  <div className="font-semibold text-foreground">{q.customer.fullName}</div>
                  <div className="text-[11px] text-muted-foreground">{q.customer.mobile}</div>
                </div>

                <div className="flex items-center gap-1.5">
                  {cleanMobile && (
                    <>
                      <a
                        href={`tel:${cleanMobile}`}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300"
                        title="Call"
                      >
                        <Phone size={13} />
                      </a>
                      <a
                        href={`https://wa.me/91${cleanMobile}?text=${encodeURIComponent(`नमस्कार ${q.customer.fullName}, आपल्या कोटेशन क्र. ${q.quotationNumber} बाबत संपर्क.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600 text-white"
                        title="WhatsApp"
                      >
                        <MessageCircle size={13} />
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* Total Amount & Action */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60 bg-muted/30 -mx-3.5 -mb-3.5 p-3 rounded-b-xl">
                <div>
                  <div className="text-[11px] text-muted-foreground">एकूण रक्कम (Total)</div>
                  <div className="text-sm font-bold text-foreground">{formatInr(q.totalAmount)}</div>
                </div>

                <Link
                  to={`/admin/quotations/${q.id}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-teal-700 text-white px-3 py-1.5 text-xs font-semibold hover:bg-teal-800 active:scale-95 transition-transform"
                >
                  <span>पहा / प्रिंट (View)</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* DESKTOP TABLE VIEW (>= md screens) */}
      <div className="hidden md:block border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <Table>
          <THead>
            <TR className="bg-muted/60">
              <TH>Number</TH>
              <TH>Customer</TH>
              <TH>Date</TH>
              <TH className="text-right">Total</TH>
              <TH className="text-center">{t("status")}</TH>
              <TH className="text-right">Action</TH>
            </TR>
          </THead>
          <TBody>
            {data?.map((q) => (
              <TR key={q.id}>
                <TD>
                  <Link to={`/admin/quotations/${q.id}`} className="font-bold text-teal-800 hover:underline">
                    {q.quotationNumber}
                  </Link>
                </TD>
                <TD>
                  <div className="font-medium text-foreground">{q.customer.fullName}</div>
                  <div className="text-xs text-muted-foreground">{q.customer.mobile}</div>
                </TD>
                <TD className="text-xs">{formatDate(q.createdAt)}</TD>
                <TD className="text-right font-bold text-foreground">{formatInr(q.totalAmount)}</TD>
                <TD className="text-center">
                  <Badge status={q.status}>{q.status}</Badge>
                </TD>
                <TD className="text-right">
                  <Link
                    to={`/admin/quotations/${q.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground"
                  >
                    View
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {!isLoading && !data?.length && (
        <div className="text-center py-10 bg-card rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          {isMarathi ? "कोणतेही कोटेशन सापडले नाही." : "No quotations found."}
        </div>
      )}
    </div>
  );
}

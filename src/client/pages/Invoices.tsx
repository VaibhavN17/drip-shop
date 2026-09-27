import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Droplets,
  ShoppingCart,
  FileText,
  Phone,
  MessageCircle,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatInr, formatDate } from "@/lib/utils";

interface Invoice {
  id: string;
  invoiceNumber: string;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  paymentStatus: string;
  invoiceDate: string;
  notes?: string | null;
  customer: { fullName: string; mobile: string; village?: string | null };
}

const STATUS_OPTIONS = [
  { value: "", label: "सर्व स्थिती (All statuses)" },
  { value: "UNPAID", label: "बाकी (Unpaid)" },
  { value: "PARTIAL", label: "अंशतः (Partial)" },
  { value: "PAID", label: "पूर्ण जमा (Paid)" },
];

function getBillTypeBadge(notes?: string | null) {
  if (notes?.includes("मिनी स्प्रिंकलर"))
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 font-semibold">
        <Droplets size={11} /> मिनी स्प्रिंकलर
      </span>
    );
  if (notes?.includes("रेग्युलर"))
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 font-semibold">
        <ShoppingCart size={11} /> रेग्युलर
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 font-semibold">
      <FileText size={11} /> ठिबक / Subsidy
    </span>
  );
}

export default function InvoicesPage() {
  const { t, lang } = useI18n();
  const isMarathi = lang === "mr";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", search, status],
    queryFn: () =>
      api.get<Invoice[]>(`/invoices?search=${encodeURIComponent(search)}&paymentStatus=${status}&limit=100`),
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header and 3 Bill Creation Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("invoices")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isMarathi ? "सर्व टॅक्स व रेग्युलर बिले" : "Tax and regular customer bills"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mini Sprinkler Tax Bill */}
          <Link to="/admin/invoices/new-mini-sprinkler">
            <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold gap-1.5 shadow-xs h-9">
              <Droplets size={14} />
              <span>⚡ मिनी स्प्रिंकलर बिल</span>
            </Button>
          </Link>

          {/* Regular Cash Bill */}
          <Link to="/admin/invoices/new-regular">
            <Button size="sm" className="bg-orange-600 hover:bg-orange-700 text-white font-semibold gap-1.5 shadow-xs h-9">
              <ShoppingCart size={14} />
              <span>🛒 रेग्युलर कॅश बिल</span>
            </Button>
          </Link>

          {/* Subsidy Bill */}
          <Link to="/admin/invoices/new">
            <Button size="sm" variant="outline" className="border-border text-foreground gap-1.5 h-9">
              <FileText size={14} />
              <span>ठिबक / Subsidy</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Status Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={isMarathi ? "बिल नं किंवा ग्राहकाचे नाव..." : "Search invoice or customer..."}
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

        <Select
          className="w-44 h-10 bg-white"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_OPTIONS.slice(1)}
          placeholder={isMarathi ? "सर्व स्थिती (All)" : "All statuses"}
        />
      </div>

      {isLoading && (
        <div className="text-sm text-muted-foreground py-6 text-center">
          {isMarathi ? "बिले लोड होत आहेत..." : "Loading invoices..."}
        </div>
      )}

      {/* MOBILE CARD VIEW (< md screens) */}
      <div className="grid gap-3 md:hidden">
        {data?.map((inv) => {
          const cleanMobile = inv.customer.mobile?.replace(/\D/g, "");
          const isOverdue = inv.balanceAmount > 0;
          return (
            <div
              key={inv.id}
              className="rounded-xl border border-border bg-card p-3.5 shadow-2xs space-y-3"
            >
              {/* Header: Invoice Number & Bill Type Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Link
                    to={`/admin/invoices/${inv.id}`}
                    className="font-bold text-base text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>{inv.invoiceNumber}</span>
                    <ChevronRight size={15} className="text-muted-foreground" />
                  </Link>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {formatDate(inv.invoiceDate)}
                  </div>
                </div>
                <div>{getBillTypeBadge(inv.notes)}</div>
              </div>

              {/* Customer Info */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-border/50">
                <div>
                  <div className="font-semibold text-foreground">{inv.customer.fullName}</div>
                  <div className="text-[11px] text-muted-foreground">{inv.customer.mobile}</div>
                </div>

                {/* 1-Tap Call & WhatsApp */}
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
                        href={`https://wa.me/91${cleanMobile}?text=${encodeURIComponent(`नमस्कार ${inv.customer.fullName}, आपल्या बिल क्र. ${inv.invoiceNumber} बाबत संपर्क.`)}`}
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

              {/* Amount and Payment Status */}
              <div className="flex items-center justify-between pt-2 border-t border-border/60 bg-muted/30 -mx-3.5 -mb-3.5 p-3 rounded-b-xl">
                <div>
                  <div className="text-[11px] text-muted-foreground">एकूण रक्कम (Total)</div>
                  <div className="text-sm font-bold text-foreground">{formatInr(inv.totalAmount)}</div>
                </div>

                {isOverdue && (
                  <div>
                    <div className="text-[11px] text-amber-800 font-medium">बाकी (Balance)</div>
                    <div className="text-sm font-bold text-amber-900">{formatInr(inv.balanceAmount)}</div>
                  </div>
                )}

                <div>
                  <Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge>
                </div>
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
              <TH>Type</TH>
              <TH>Customer</TH>
              <TH>Date</TH>
              <TH className="text-right">Total</TH>
              <TH className="text-right">Balance</TH>
              <TH className="text-center">{t("paymentStatus")}</TH>
            </TR>
          </THead>
          <TBody>
            {data?.map((inv) => (
              <TR key={inv.id}>
                <TD>
                  <Link to={`/admin/invoices/${inv.id}`} className="font-bold text-emerald-800 hover:underline">
                    {inv.invoiceNumber}
                  </Link>
                </TD>
                <TD>{getBillTypeBadge(inv.notes)}</TD>
                <TD>
                  <div className="font-medium text-foreground">{inv.customer.fullName}</div>
                  <div className="text-xs text-muted-foreground">{inv.customer.mobile}</div>
                </TD>
                <TD className="text-xs">{formatDate(inv.invoiceDate)}</TD>
                <TD className="text-right font-bold text-foreground">{formatInr(inv.totalAmount)}</TD>
                <TD className="text-right font-semibold text-amber-800">
                  {inv.balanceAmount > 0 ? formatInr(inv.balanceAmount) : "₹0"}
                </TD>
                <TD className="text-center">
                  <Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {!isLoading && !data?.length && (
        <div className="text-center py-10 bg-card rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          {isMarathi ? "कोणतेही बिल सापडले नाही." : "No invoices found."}
        </div>
      )}
    </div>
  );
}

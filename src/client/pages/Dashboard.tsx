import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Droplets,
  FileText,
  ShoppingCart,
  UserPlus,
  TrendingUp,
  AlertTriangle,
  Receipt,
  Users,
  Package,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
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
  recentQuotations: Array<{
    id: string;
    quotationNumber: string;
    totalAmount: number;
    status: string;
    createdAt?: string;
    customer: { fullName: string };
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    totalAmount: number;
    paymentStatus: string;
    invoiceDate?: string;
    notes?: string | null;
    customer: { fullName: string };
  }>;
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const isMarathi = lang === "mr";

  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/reports/dashboard"),
  });

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
          <span>{isMarathi ? "माहिती लोड होत आहे..." : "Loading dashboard..."}</span>
        </div>
      </div>
    );
  }

  const chartData = [
    { name: isMarathi ? "आजची विक्री" : "Today", value: data.todaySales },
    { name: isMarathi ? "या महिन्याची" : "This Month", value: data.monthSales },
  ];

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-200">
              <Sparkles size={14} className="text-amber-300" />
              {isMarathi ? "दुकान व्यवस्थापन डॅशबोर्ड" : "Shop Management Portal"}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              {isMarathi ? "नमस्कार, शेतकरी राजा हार्डवेअर" : "Welcome, Shetkari Raja"}
            </h1>
            <p className="text-xs text-emerald-100 flex items-center gap-1.5 pt-0.5">
              <Calendar size={13} />
              {new Date().toLocaleDateString(isMarathi ? "mr-IN" : "en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/admin/invoices/new-mini-sprinkler"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-sm hover:bg-emerald-50 active:scale-95 transition-transform"
            >
              <Droplets size={14} className="text-emerald-700" />
              ⚡ {isMarathi ? "मिनी स्प्रिंकलर बिल" : "Mini Sprinkler Bill"}
            </Link>
            <Link
              to="/admin/quotations/new-mini-sprinkler"
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-950/70 border border-emerald-400/40 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 active:scale-95 transition-transform"
            >
              <FileText size={14} className="text-emerald-300" />
              ⚡ {isMarathi ? "कोटेशन (1 Acre)" : "1 Acre Quote"}
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Big Quick-Action Cards for 1-Tap Shop Tasks */}
      <div>
        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2.5 px-0.5">
          {isMarathi ? "⚡ जलद कामे (Quick Actions)" : "⚡ Quick Actions"}
        </div>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {/* 1. Mini Sprinkler Bill */}
          <Link
            to="/admin/invoices/new-mini-sprinkler"
            className="group relative flex flex-col justify-between rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 shadow-2xs hover:bg-emerald-100 hover:border-emerald-300 active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-700 text-white shadow-xs">
                <Droplets size={18} />
              </span>
              <span className="text-[10px] font-bold bg-emerald-700 text-white px-1.5 py-0.5 rounded">
                1-Click
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs sm:text-sm font-bold text-emerald-950 leading-tight">
                {isMarathi ? "मिनी स्प्रिंकलर बिल" : "Mini Sprinkler Bill"}
              </div>
              <div className="text-[11px] text-emerald-800/80 mt-0.5 hidden sm:block">
                Tax Invoice (Excel दरासह)
              </div>
            </div>
          </Link>

          {/* 2. Mini Sprinkler Quotation */}
          <Link
            to="/admin/quotations/new-mini-sprinkler"
            className="group relative flex flex-col justify-between rounded-xl border border-teal-200 bg-teal-50/70 p-3.5 shadow-2xs hover:bg-teal-100 hover:border-teal-300 active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-700 text-white shadow-xs">
                <FileText size={18} />
              </span>
              <span className="text-[10px] font-bold bg-teal-700 text-white px-1.5 py-0.5 rounded">
                1-Click
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs sm:text-sm font-bold text-teal-950 leading-tight">
                {isMarathi ? "मिनी स्प्रिंकलर कोटेशन" : "Mini Sprinkler Quote"}
              </div>
              <div className="text-[11px] text-teal-800/80 mt-0.5 hidden sm:block">
                १ एकर संच व शेतकरी हिस्सा
              </div>
            </div>
          </Link>

          {/* 3. Regular Cash Bill */}
          <Link
            to="/admin/invoices/new-regular"
            className="group relative flex flex-col justify-between rounded-xl border border-orange-200 bg-orange-50/70 p-3.5 shadow-2xs hover:bg-orange-100 hover:border-orange-300 active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-600 text-white shadow-xs">
                <ShoppingCart size={18} />
              </span>
              <span className="text-[10px] font-bold bg-orange-600 text-white px-1.5 py-0.5 rounded">
                Cash
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs sm:text-sm font-bold text-orange-950 leading-tight">
                {isMarathi ? "रेग्युलर कॅश बिल" : "Regular Cash Bill"}
              </div>
              <div className="text-[11px] text-orange-800/80 mt-0.5 hidden sm:block">
                काऊंटर विक्रीसाठी जलद बिल
              </div>
            </div>
          </Link>

          {/* 4. Add Customer */}
          <Link
            to="/admin/customers"
            className="group relative flex flex-col justify-between rounded-xl border border-blue-200 bg-blue-50/70 p-3.5 shadow-2xs hover:bg-blue-100 hover:border-blue-300 active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs">
                <UserPlus size={18} />
              </span>
              <span className="text-[10px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded">
                + Farmer
              </span>
            </div>
            <div className="mt-3">
              <div className="text-xs sm:text-sm font-bold text-blue-950 leading-tight">
                {isMarathi ? "नवीन शेतकरी नोंदणी" : "Add New Farmer"}
              </div>
              <div className="text-[11px] text-blue-800/80 mt-0.5 hidden sm:block">
                नाव, मोबाईल, गट क्र. व क्षेत्र
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Key Financial & Business Metric Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {/* Today's Sales */}
        <Card className="border-emerald-200 bg-white shadow-xs">
          <CardHeader className="pb-1 pt-3 px-3.5">
            <CardTitle className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
              <TrendingUp size={13} className="text-emerald-600" />
              {isMarathi ? "आजची विक्री" : "Today's Sales"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3.5 pb-3">
            <div className="text-base sm:text-lg font-bold text-emerald-950 truncate">
              {formatInr(data.todaySales)}
            </div>
          </CardContent>
        </Card>

        {/* Month Sales */}
        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="pb-1 pt-3 px-3.5">
            <CardTitle className="text-xs font-semibold text-muted-foreground">
              {isMarathi ? "या महिन्याची विक्री" : "Month Sales"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3.5 pb-3">
            <div className="text-base sm:text-lg font-bold text-foreground truncate">
              {formatInr(data.monthSales)}
            </div>
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card className={`shadow-xs ${data.pendingPayments > 0 ? "border-amber-300 bg-amber-50/40" : "border-border bg-white"}`}>
          <CardHeader className="pb-1 pt-3 px-3.5">
            <CardTitle className="text-xs font-semibold text-amber-800 flex items-center gap-1">
              <AlertTriangle size={13} className="text-amber-600" />
              {isMarathi ? "येणे बाकी" : "Pending Balance"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3.5 pb-3">
            <div className="text-base sm:text-lg font-bold text-amber-950 truncate">
              {formatInr(data.pendingPayments)}
            </div>
          </CardContent>
        </Card>

        {/* Total Invoices */}
        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="pb-1 pt-3 px-3.5">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Receipt size={13} />
              {isMarathi ? "एकूण बिल" : "Invoices"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3.5 pb-3">
            <div className="text-base sm:text-lg font-bold text-foreground">
              {data.totalInvoices}
            </div>
          </CardContent>
        </Card>

        {/* Total Quotations */}
        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="pb-1 pt-3 px-3.5">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <FileText size={13} />
              {isMarathi ? "एकूण कोटेशन" : "Quotations"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3.5 pb-3">
            <div className="text-base sm:text-lg font-bold text-foreground">
              {data.totalQuotations}
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border-border bg-white shadow-xs">
          <CardHeader className="pb-1 pt-3 px-3.5">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Users size={13} />
              {isMarathi ? "एकूण ग्राहक" : "Customers"}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3.5 pb-3">
            <div className="text-base sm:text-lg font-bold text-foreground">
              {data.totalCustomers}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Overview Chart */}
      <Card className="shadow-xs border-border">
        <CardHeader className="pb-2 pt-4 px-4 border-b border-border/60">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp size={16} className="text-emerald-700" />
              {isMarathi ? "विक्री आढावा (Sales Comparison)" : "Sales Overview"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="h-48 pt-4 px-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <XAxis dataKey="name" fontSize={12} stroke="#64748b" />
              <YAxis fontSize={11} stroke="#64748b" tickFormatter={(v) => `₹${v}`} />
              <Tooltip formatter={(v: number) => formatInr(v)} />
              <Bar dataKey="value" fill="#047857" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Recent Activity Sections (Touch-Friendly List Cards on Mobile & Tablet) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Invoices */}
        <Card className="shadow-xs border-border">
          <CardHeader className="pb-2 pt-4 px-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Receipt size={16} className="text-emerald-700" />
                {isMarathi ? "ताजी बिले (Recent Bills)" : "Recent Invoices"}
              </CardTitle>
              <Link
                to="/admin/invoices"
                className="text-xs font-semibold text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                {isMarathi ? "सर्व पहा" : "View All"}
                <ChevronRight size={14} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {data.recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                to={`/admin/invoices/${inv.id}`}
                className="flex items-center justify-between rounded-xl p-2.5 text-xs hover:bg-muted/70 active:bg-muted transition-colors border border-transparent hover:border-border/60"
              >
                <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                  <div className="font-bold text-foreground truncate">
                    {inv.customer.fullName}
                  </div>
                  <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                    <span className="font-medium text-emerald-800">{inv.invoiceNumber}</span>
                    {inv.notes?.includes("मिनी स्प्रिंकलर") && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.2 rounded font-medium">
                        मिनी स्प्रिंकलर
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <span className="font-bold text-foreground">{formatInr(inv.totalAmount)}</span>
                  <Badge status={inv.paymentStatus}>{inv.paymentStatus}</Badge>
                </div>
              </Link>
            ))}
            {!data.recentInvoices.length && (
              <p className="text-xs text-muted-foreground py-4 text-center">
                {isMarathi ? "अद्याप कोणतीही बिले नाहीत." : "No invoices yet."}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Quotations */}
        <Card className="shadow-xs border-border">
          <CardHeader className="pb-2 pt-4 px-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText size={16} className="text-teal-700" />
                {isMarathi ? "ताजी कोटेशन्स (Recent Quotes)" : "Recent Quotations"}
              </CardTitle>
              <Link
                to="/admin/quotations"
                className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-0.5"
              >
                {isMarathi ? "सर्व पहा" : "View All"}
                <ChevronRight size={14} />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-2 space-y-1">
            {data.recentQuotations.map((q) => (
              <Link
                key={q.id}
                to={`/admin/quotations/${q.id}`}
                className="flex items-center justify-between rounded-xl p-2.5 text-xs hover:bg-muted/70 active:bg-muted transition-colors border border-transparent hover:border-border/60"
              >
                <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                  <div className="font-bold text-foreground truncate">
                    {q.customer.fullName}
                  </div>
                  <div className="text-[11px] text-muted-foreground font-medium text-teal-800">
                    {q.quotationNumber}
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <span className="font-bold text-foreground">{formatInr(q.totalAmount)}</span>
                  <Badge status={q.status}>{q.status}</Badge>
                </div>
              </Link>
            ))}
            {!data.recentQuotations.length && (
              <p className="text-xs text-muted-foreground py-4 text-center">
                {isMarathi ? "अद्याप कोणतीही कोटेशन्स नाहीत." : "No quotations yet."}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

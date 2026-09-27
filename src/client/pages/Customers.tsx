import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Search,
  Phone,
  MessageCircle,
  MapPin,
  FileText,
  Droplets,
  User,
  ChevronRight,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const customerFormSchema = z.object({
  fullName: z.string().min(1, "Required"),
  mobile: z.string().min(10, "Enter a valid mobile number"),
  village: z.string().optional(),
  taluka: z.string().optional(),
  district: z.string().optional(),
  address: z.string().optional(),
  surveyNumber: z.string().optional(),
  landArea: z.coerce.number().optional(),
});
type CustomerForm = z.infer<typeof customerFormSchema>;

interface Customer {
  id: string;
  customerCode: string;
  fullName: string;
  mobile: string;
  village?: string | null;
  taluka?: string | null;
  district?: string | null;
  surveyNumber?: string | null;
  landArea?: number | null;
}

export default function CustomersPage() {
  const { t, lang } = useI18n();
  const isMarathi = lang === "mr";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => api.get<Customer[]>(`/customers?search=${encodeURIComponent(search)}&limit=100`),
  });

  const form = useForm<CustomerForm>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      taluka: "Vaijapur",
      district: "छ. संभाजीनगर",
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: CustomerForm) => api.post("/customers", values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setOpen(false);
      form.reset();
    },
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Header and Add button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("customers")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isMarathi ? "शेतकरी यादी व संपर्क माहिती" : "Farmer directory and contact details"}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs gap-1.5 h-10 px-4">
              <Plus size={16} />
              <span>{t("newCustomer")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <User size={18} className="text-emerald-700" />
                {t("newCustomer")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold">{t("customerName")} *</Label>
                  <Input placeholder="उदा. Vaibhav More" {...form.register("fullName")} className="h-10" />
                  {form.formState.errors.fullName && (
                    <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{t("mobile")} *</Label>
                  <Input type="tel" placeholder="उदा. 8010741843" {...form.register("mobile")} className="h-10" />
                  {form.formState.errors.mobile && (
                    <p className="text-xs text-destructive">{form.formState.errors.mobile.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{t("village")}</Label>
                  <Input placeholder="Lakh Khandala" {...form.register("village")} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{t("taluka")}</Label>
                  <Input placeholder="Vaijapur" {...form.register("taluka")} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{t("district")}</Label>
                  <Input placeholder="छ. संभाजीनगर" {...form.register("district")} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{t("surveyNumber")}</Label>
                  <Input placeholder="गट क्र." {...form.register("surveyNumber")} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{t("landArea")} (एकर)</Label>
                  <Input type="number" step="0.01" placeholder="उदा. 1.0" {...form.register("landArea")} className="h-10" />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold">{t("address")}</Label>
                  <Input placeholder="पत्ता..." {...form.register("address")} className="h-10" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold">
                  {createMutation.isPending ? "जतन होत आहे..." : t("save")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar with clear */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={isMarathi ? "शेतकऱ्याचे नाव किंवा मोबाईल नंबरने शोधा..." : `${t("search")} by name or phone...`}
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
          {isMarathi ? "माहिती लोड होत आहे..." : "Loading customers..."}
        </div>
      )}

      {/* MOBILE CARD VIEW (< md screens) */}
      <div className="grid gap-3 md:hidden">
        {data?.map((c) => {
          const cleanMobile = c.mobile?.replace(/\D/g, "");
          return (
            <div
              key={c.id}
              className="rounded-xl border border-border bg-card p-3.5 shadow-2xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <Link
                    to={`/admin/customers/${c.id}`}
                    className="font-bold text-base text-foreground hover:text-emerald-700 transition-colors flex items-center gap-1"
                  >
                    <span>{c.fullName}</span>
                    <ChevronRight size={14} className="text-muted-foreground" />
                  </Link>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin size={12} className="text-emerald-700" />
                    <span>
                      {c.village || "-"}{c.taluka ? `, ${c.taluka}` : ""}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded font-semibold">
                  {c.customerCode}
                </span>
              </div>

              {/* 1-Tap Action Buttons (Call, WhatsApp, Create Bill, Create Quote) */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-border/60">
                {/* Call */}
                <a
                  href={`tel:${cleanMobile}`}
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 active:scale-95 transition-transform"
                >
                  <Phone size={13} className="text-emerald-700" />
                  <span>कॉल</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/91${cleanMobile}?text=${encodeURIComponent(`नमस्कार ${c.fullName}, शेतकरी राजा हार्डवेअरमधून संपर्क करत आहोत.`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 active:scale-95 transition-transform shadow-2xs"
                >
                  <MessageCircle size={13} />
                  <span>व्हॉट्सअॅप</span>
                </a>

                {/* Mini Sprinkler Bill */}
                <Link
                  to="/admin/invoices/new-mini-sprinkler"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 active:scale-95 transition-transform ml-auto"
                >
                  <Droplets size={12} className="text-emerald-700" />
                  <span>बिल</span>
                </Link>

                {/* Quotation */}
                <Link
                  to="/admin/quotations/new-mini-sprinkler"
                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 active:scale-95 transition-transform"
                >
                  <FileText size={12} className="text-teal-700" />
                  <span>कोटेशन</span>
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
              <TH className="w-24">Code</TH>
              <TH>{t("customerName")}</TH>
              <TH>{t("mobile")}</TH>
              <TH>{t("village")}</TH>
              <TH>{t("taluka")}</TH>
              <TH>{t("district")}</TH>
              <TH className="text-right">कृती (Actions)</TH>
            </TR>
          </THead>
          <TBody>
            {data?.map((c) => {
              const cleanMobile = c.mobile?.replace(/\D/g, "");
              return (
                <TR key={c.id}>
                  <TD className="font-mono text-xs text-muted-foreground">{c.customerCode}</TD>
                  <TD>
                    <Link to={`/admin/customers/${c.id}`} className="font-semibold text-emerald-800 hover:underline">
                      {c.fullName}
                    </Link>
                  </TD>
                  <TD>
                    <div className="flex items-center gap-2">
                      <span>{c.mobile}</span>
                      <a href={`tel:${cleanMobile}`} className="text-emerald-700 hover:text-emerald-900" title="Call">
                        <Phone size={13} />
                      </a>
                    </div>
                  </TD>
                  <TD>{c.village ?? "-"}</TD>
                  <TD>{c.taluka ?? "-"}</TD>
                  <TD>{c.district ?? "-"}</TD>
                  <TD className="text-right">
                    <div className="inline-flex items-center gap-1.5 justify-end">
                      <a
                        href={`https://wa.me/91${cleanMobile}?text=${encodeURIComponent(`नमस्कार ${c.fullName}, शेतकरी राजा हार्डवेअरमधून संपर्क करत आहोत.`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 rounded hover:bg-emerald-50 text-emerald-700"
                        title="WhatsApp"
                      >
                        <MessageCircle size={15} />
                      </a>
                      <Link
                        to="/admin/invoices/new-mini-sprinkler"
                        className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                      >
                        + बिल
                      </Link>
                    </div>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
      </div>

      {!isLoading && !data?.length && (
        <div className="text-center py-10 bg-card rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          {isMarathi ? "कोणतेही ग्राहक सापडले नाहीत." : "No customers found."}
        </div>
      )}
    </div>
  );
}

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
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
  district?: string | null;
}

export default function CustomersPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["customers", search],
    queryFn: () => api.get<Customer[]>(`/customers?search=${encodeURIComponent(search)}&limit=50`),
  });

  const form = useForm<CustomerForm>({ resolver: zodResolver(customerFormSchema) });

  const createMutation = useMutation({
    mutationFn: (values: CustomerForm) => api.post("/customers", values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["customers"] });
      setOpen(false);
      form.reset();
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("customers")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus size={14} /> {t("newCustomer")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("newCustomer")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>{t("customerName")} *</Label>
                  <Input {...form.register("fullName")} />
                  {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>{t("mobile")} *</Label>
                  <Input {...form.register("mobile")} />
                  {form.formState.errors.mobile && <p className="text-xs text-destructive">{form.formState.errors.mobile.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>{t("village")}</Label>
                  <Input {...form.register("village")} />
                </div>
                <div className="space-y-1">
                  <Label>{t("taluka")}</Label>
                  <Input {...form.register("taluka")} />
                </div>
                <div className="space-y-1">
                  <Label>{t("district")}</Label>
                  <Input {...form.register("district")} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>{t("address")}</Label>
                  <Input {...form.register("address")} />
                </div>
                <div className="space-y-1">
                  <Label>{t("surveyNumber")}</Label>
                  <Input {...form.register("surveyNumber")} />
                </div>
                <div className="space-y-1">
                  <Label>{t("landArea")}</Label>
                  <Input type="number" step="0.01" {...form.register("landArea")} />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
                <Button type="submit" disabled={createMutation.isPending}>{t("save")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={`${t("search")}...`} className="pl-7" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Table>
        <THead>
          <TR>
            <TH>Code</TH>
            <TH>{t("customerName")}</TH>
            <TH>{t("mobile")}</TH>
            <TH>{t("village")}</TH>
            <TH>{t("district")}</TH>
          </TR>
        </THead>
        <TBody>
          {data?.map((c) => (
            <TR key={c.id}>
              <TD>{c.customerCode}</TD>
              <TD>
                <Link to={`/admin/customers/${c.id}`} className="font-medium text-primary hover:underline">{c.fullName}</Link>
              </TD>
              <TD>{c.mobile}</TD>
              <TD>{c.village ?? "-"}</TD>
              <TD>{c.district ?? "-"}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {!data?.length && <p className="text-sm text-muted-foreground">No customers found.</p>}
    </div>
  );
}

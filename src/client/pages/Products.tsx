import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search } from "lucide-react";
import { api } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatInr } from "@/lib/utils";

const productFormSchema = z.object({
  name: z.string().min(1),
  nameMarathi: z.string().optional(),
  categoryId: z.string().optional(),
  unit: z.string().min(1),
  hsnCode: z.string().optional(),
  gstRate: z.coerce.number().min(0).max(100),
  sellingRate: z.coerce.number().nonnegative(),
  governmentRate: z.coerce.number().optional(),
});
type ProductForm = z.infer<typeof productFormSchema>;

interface Category { id: string; name: string }
interface Product {
  id: string; productCode: string; name: string; unit: string; sellingRate: number;
  gstRate: number; governmentRate?: number | null; category?: { name: string } | null; isActive: boolean;
}

export default function ProductsPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: categories } = useQuery({ queryKey: ["categories"], queryFn: () => api.get<Category[]>("/categories") });
  const { data: products } = useQuery({
    queryKey: ["products", search],
    queryFn: () => api.get<Product[]>(`/products?search=${encodeURIComponent(search)}&limit=100`),
  });

  const form = useForm<ProductForm>({ resolver: zodResolver(productFormSchema), defaultValues: { unit: "Nos", gstRate: 18 } });

  const createMutation = useMutation({
    mutationFn: (values: ProductForm) => api.post("/products", values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
      form.reset({ unit: "Nos", gstRate: 18 });
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("products")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><Plus size={14} /> {t("newProduct")}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("newProduct")}</DialogTitle></DialogHeader>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1">
                  <Label>Name *</Label>
                  <Input {...form.register("name")} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label>Marathi Name</Label>
                  <Input {...form.register("nameMarathi")} />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select {...form.register("categoryId")} placeholder="Select..." options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))} />
                </div>
                <div className="space-y-1">
                  <Label>{t("unit")}</Label>
                  <Input {...form.register("unit")} />
                </div>
                <div className="space-y-1">
                  <Label>HSN Code</Label>
                  <Input {...form.register("hsnCode")} />
                </div>
                <div className="space-y-1">
                  <Label>GST %</Label>
                  <Input type="number" step="0.01" {...form.register("gstRate")} />
                </div>
                <div className="space-y-1">
                  <Label>Selling Rate *</Label>
                  <Input type="number" step="0.01" {...form.register("sellingRate")} />
                </div>
                <div className="space-y-1">
                  <Label>Government Rate</Label>
                  <Input type="number" step="0.01" {...form.register("governmentRate")} />
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
            <TH>Code</TH><TH>Name</TH><TH>Category</TH><TH>Unit</TH><TH>GST</TH><TH>Rate</TH><TH>Govt Rate</TH>
          </TR>
        </THead>
        <TBody>
          {products?.map((p) => (
            <TR key={p.id}>
              <TD>{p.productCode}</TD>
              <TD className="font-medium">{p.name}</TD>
              <TD>{p.category?.name ?? "-"}</TD>
              <TD>{p.unit}</TD>
              <TD>{Number(p.gstRate)}%</TD>
              <TD>{formatInr(p.sellingRate)}</TD>
              <TD>{p.governmentRate ? formatInr(p.governmentRate) : "-"}</TD>
            </TR>
          ))}
        </TBody>
      </Table>
      {!products?.length && <p className="text-sm text-muted-foreground">No products found.</p>}
    </div>
  );
}

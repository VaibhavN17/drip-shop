import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Search, Package, X, Tag } from "lucide-react";
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
  name: z.string().min(1, "Name required"),
  nameMarathi: z.string().optional(),
  categoryId: z.string().optional(),
  unit: z.string().min(1),
  hsnCode: z.string().optional(),
  gstRate: z.coerce.number().min(0).max(100),
  sellingRate: z.coerce.number().nonnegative(),
  governmentRate: z.coerce.number().optional(),
});
type ProductForm = z.infer<typeof productFormSchema>;

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  productCode: string;
  name: string;
  nameMarathi?: string | null;
  unit: string;
  sellingRate: number;
  gstRate: number;
  governmentRate?: number | null;
  category?: { name: string } | null;
  isActive: boolean;
}

export default function ProductsPage() {
  const { t, lang } = useI18n();
  const isMarathi = lang === "mr";
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<Category[]>("/categories"),
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ["products", search],
    queryFn: () => api.get<Product[]>(`/products?search=${encodeURIComponent(search)}&limit=150`),
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productFormSchema),
    defaultValues: { unit: "Nos", gstRate: 18 },
  });

  const createMutation = useMutation({
    mutationFn: (values: ProductForm) => api.post("/products", values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      setOpen(false);
      form.reset({ unit: "Nos", gstRate: 18 });
    },
  });

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Header & New Product Button */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            {t("products")}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isMarathi ? "दुकानातील सर्व वस्तू व त्यांचे दर" : "Inventory items and price rates"}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold shadow-xs gap-1.5 h-10 px-4">
              <Plus size={16} />
              <span>{t("newProduct")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <Package size={18} className="text-emerald-700" />
                {t("newProduct")}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit((v) => createMutation.mutate(v))} className="space-y-3 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold">Product Name *</Label>
                  <Input placeholder="उदा. Mini Sprinkler Nozzle 2.5 mm" {...form.register("name")} className="h-10" />
                  {form.formState.errors.name && (
                    <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <Label className="text-xs font-semibold">मराठी नाव (Marathi Name)</Label>
                  <Input placeholder="उदा. मिनी स्प्रिंकलर नोझल २.५ मिमी" {...form.register("nameMarathi")} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">Category</Label>
                  <Select
                    {...form.register("categoryId")}
                    placeholder="Select category..."
                    options={(categories ?? []).map((c) => ({ value: c.id, label: c.name }))}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">{t("unit")}</Label>
                  <Input placeholder="Nos / Mtr / Set" {...form.register("unit")} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">HSN Code</Label>
                  <Input placeholder="8424..." {...form.register("hsnCode")} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">GST %</Label>
                  <Input type="number" step="1" placeholder="18 किंवा 5" {...form.register("gstRate")} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">विक्री दर (Selling Rate ₹) *</Label>
                  <Input type="number" step="0.01" placeholder="0.00" {...form.register("sellingRate")} className="h-10 font-bold" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-semibold">शासकीय दर (Govt Rate ₹)</Label>
                  <Input type="number" step="0.01" placeholder="0.00" {...form.register("governmentRate")} className="h-10" />
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

      {/* Search Input with Clear button */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={isMarathi ? "वस्तूचे नाव किंवा कोडने शोधा..." : "Search products..."}
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
          {isMarathi ? "उत्पादने लोड होत आहेत..." : "Loading products..."}
        </div>
      )}

      {/* MOBILE CARD VIEW (< md screens) */}
      <div className="grid gap-2.5 md:hidden">
        {products?.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-border bg-card p-3 shadow-2xs space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="font-bold text-sm text-foreground leading-tight">
                  {p.name}
                </div>
                {p.nameMarathi && (
                  <div className="text-xs text-muted-foreground">{p.nameMarathi}</div>
                )}
                {p.category?.name && (
                  <span className="inline-flex items-center gap-1 text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded font-medium mt-1">
                    <Tag size={10} />
                    {p.category.name}
                  </span>
                )}
              </div>

              <div className="text-right shrink-0">
                <div className="text-base font-bold text-emerald-800">
                  {formatInr(p.sellingRate)}
                </div>
                <div className="text-[11px] text-muted-foreground">/{p.unit}</div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-border/50 text-muted-foreground">
              <span>Code: {p.productCode}</span>
              <span>GST: {Number(p.gstRate)}%</span>
              {p.governmentRate ? (
                <span className="text-emerald-800 font-medium">Govt: {formatInr(p.governmentRate)}</span>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      {/* DESKTOP TABLE VIEW (>= md screens) */}
      <div className="hidden md:block border border-border rounded-xl bg-card overflow-hidden shadow-xs">
        <Table>
          <THead>
            <TR className="bg-muted/60">
              <TH className="w-24">Code</TH>
              <TH>Name</TH>
              <TH>Category</TH>
              <TH className="w-20">Unit</TH>
              <TH className="w-16">GST</TH>
              <TH className="text-right">Rate</TH>
              <TH className="text-right">Govt Rate</TH>
            </TR>
          </THead>
          <TBody>
            {products?.map((p) => (
              <TR key={p.id}>
                <TD className="font-mono text-xs text-muted-foreground">{p.productCode}</TD>
                <TD>
                  <div className="font-medium text-foreground">{p.name}</div>
                  {p.nameMarathi && <div className="text-xs text-muted-foreground">{p.nameMarathi}</div>}
                </TD>
                <TD className="text-xs">{p.category?.name ?? "-"}</TD>
                <TD className="text-xs">{p.unit}</TD>
                <TD className="text-xs">{Number(p.gstRate)}%</TD>
                <TD className="text-right font-bold text-emerald-800">{formatInr(p.sellingRate)}</TD>
                <TD className="text-right text-xs text-muted-foreground">
                  {p.governmentRate ? formatInr(p.governmentRate) : "-"}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {!isLoading && !products?.length && (
        <div className="text-center py-10 bg-card rounded-xl border border-dashed border-border p-6 text-sm text-muted-foreground">
          {isMarathi ? "कोणतेही उत्पादन सापडले नाही." : "No products found."}
        </div>
      )}
    </div>
  );
}

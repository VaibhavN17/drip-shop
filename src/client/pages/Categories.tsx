import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { api, ApiClientError } from "@/lib/api";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";

interface Category { id: string; name: string; nameMarathi?: string | null }

export default function CategoriesPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [nameMarathi, setNameMarathi] = useState("");
  const [error, setError] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data } = useQuery({ queryKey: ["categories"], queryFn: () => api.get<Category[]>("/categories") });

  const createMutation = useMutation({
    mutationFn: () => api.post("/categories", { name, nameMarathi }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["categories"] });
      setName("");
      setNameMarathi("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/categories/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["categories"] }),
    onError: (err) => setError(err instanceof ApiClientError ? err.message : "Failed to delete"),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">{t("categories")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          createMutation.mutate();
        }}
        className="flex flex-wrap items-end gap-2"
      >
        <div>
          <label className="text-xs text-muted-foreground">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Marathi Name</label>
          <Input value={nameMarathi} onChange={(e) => setNameMarathi(e.target.value)} />
        </div>
        <Button type="submit"><Plus size={14} /> Add</Button>
      </form>
      {error && <p className="text-sm text-destructive">{error}</p>}

      <Table>
        <THead><TR><TH>Name</TH><TH>Marathi</TH><TH></TH></TR></THead>
        <TBody>
          {data?.map((c) => (
            <TR key={c.id}>
              <TD>{c.name}</TD>
              <TD>{c.nameMarathi ?? "-"}</TD>
              <TD>
                <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(c.id)}>
                  <Trash2 size={14} />
                </Button>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { api, ApiClientError } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface UserRow {
  id: string; username: string; email: string; fullName: string; role: string; isActive: boolean; lastLoginAt?: string | null;
}

const ROLES = ["STAFF", "ADMIN", "OWNER"];

export default function UsersPage() {
  const { user } = useAuth();
  const { t } = useI18n();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "", fullName: "", role: "STAFF" });
  const [error, setError] = useState<string | null>(null);

  const { data } = useQuery({ queryKey: ["users"], queryFn: () => api.get<UserRow[]>("/users") });

  const createMutation = useMutation({
    mutationFn: () => api.post("/users", form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      setOpen(false);
      setForm({ username: "", email: "", password: "", fullName: "", role: "STAFF" });
      setError(null);
    },
    onError: (err) => setError(err instanceof ApiClientError ? err.message : "Failed to create user"),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/users/${id}/deactivate`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });

  const canManage = user?.role === "OWNER" || user?.role === "ADMIN";
  if (!canManage) return <p className="text-sm text-muted-foreground">You don't have access to this page.</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("users")}</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm"><Plus size={14} /> New User</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>New User</DialogTitle></DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(); }} className="space-y-3">
              <div className="space-y-1"><Label>Full Name</Label><Input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Username</Label><Input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required /></div>
              <div className="space-y-1"><Label>Password</Label><Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} required minLength={8} /></div>
              <div className="space-y-1">
                <Label>Role</Label>
                <Select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} options={ROLES.map((r) => ({ value: r, label: r }))} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
                <Button type="submit" disabled={createMutation.isPending}>{t("save")}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <THead><TR><TH>Name</TH><TH>Username</TH><TH>Email</TH><TH>Role</TH><TH>Status</TH><TH></TH></TR></THead>
        <TBody>
          {data?.map((u) => (
            <TR key={u.id}>
              <TD>{u.fullName}</TD>
              <TD>{u.username}</TD>
              <TD>{u.email}</TD>
              <TD>{u.role}</TD>
              <TD><Badge className={u.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>{u.isActive ? "Active" : "Inactive"}</Badge></TD>
              <TD>
                {u.isActive && u.id !== user?.id && (
                  <Button variant="ghost" size="sm" onClick={() => deactivateMutation.mutate(u.id)}>Deactivate</Button>
                )}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
}

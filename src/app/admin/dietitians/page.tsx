"use client";

import * as React from "react";
import { Plus, Save, Trash2, Loader2, Eye, EyeOff, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Dietitian = {
  id: string;
  name: string;
  credentials: string;
  specialty: string;
  bio: string;
  experience: number;
  availability: string;
  isActive: boolean;
  rating: number;
  user: { id: string; name: string | null; email: string; phone: string | null; isActive: boolean };
  _count: { patients: number; appointments: number };
};

export default function AdminDietitiansPage() {
  const [dietitians, setDietitians] = React.useState<Dietitian[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showAdd, setShowAdd] = React.useState(false);
  const [saving, setSaving] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/admin/dietitians")
      .then((r) => r.json())
      .then((d) => { if (d.success) setDietitians(d.data); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, field: string, value: string | number | boolean) => {
    setDietitians((prev) => prev.map((d) => d.id === id ? { ...d, [field]: value } : d));
  };

  const save = async (id: string) => {
    setSaving(id);
    try {
      const d = dietitians.find((x) => x.id === id);
      if (!d) return;
      const res = await fetch(`/api/admin/dietitians/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: d.name, specialty: d.specialty, bio: d.bio, experience: d.experience, availability: d.availability, isActive: d.isActive }),
      });
      const data = await res.json();
      if (data.success) toast.success("Dietitian updated");
      else toast.error("Update failed");
    } catch { toast.error("Network error"); }
    finally { setSaving(null); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    update(id, "isActive", !current);
    await save(id);
  };

  const deactivate = async (id: string) => {
    if (!confirm("Deactivate this dietitian? They will no longer be able to log in.")) return;
    try {
      const res = await fetch(`/api/admin/dietitians/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        setDietitians((prev) => prev.map((x) => x.id === id ? { ...x, isActive: false, user: { ...x.user, isActive: false } } : x));
        toast.success("Dietitian deactivated");
      }
    } catch { toast.error("Failed"); }
  };

  const addNew = async (data: any) => {
    try {
      const res = await fetch("/api/admin/dietitians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (d.success) {
        // Refetch to get the full list with relations
        const refetch = await fetch("/api/admin/dietitians").then((r) => r.json());
        if (refetch.success) setDietitians(refetch.data);
        toast.success("Dietitian created!", { description: "They can now log in with their email and password." });
        setShowAdd(false);
      } else toast.error("Create failed", { description: d.error });
    } catch { toast.error("Network error"); }
  };

  if (loading) return <><h1 className="text-2xl font-bold mb-6">Dietitians</h1><div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Dietitians</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-gradient-to-r from-primary to-secondary">
          <Plus className="w-4 h-4 mr-1" /> Add dietitian
        </Button>
      </div>

      {showAdd && (
        <div className="mb-6 p-5 rounded-2xl border border-border/40 bg-card space-y-3">
          <h3 className="text-sm font-semibold">New Dietitian</h3>
          <NewDietitianForm onSave={addNew} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="space-y-3">
        {dietitians.map((d) => (
          <div key={d.id} className="p-4 rounded-2xl border border-border/40 bg-card">
            <div className="grid lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Name</Label>
                <Input value={d.name} onChange={(e) => update(d.id, "name", e.target.value)} className="h-9 font-semibold" />
                <p className="text-[10px] text-muted-foreground">{d.user.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => toggleActive(d.id, d.isActive)} className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold", d.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>
                    {d.isActive ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Inactive</>}
                  </button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Specialty</Label>
                <Input value={d.specialty} onChange={(e) => update(d.id, "specialty", e.target.value)} className="h-9" />
                <Label className="text-xs">Experience (years)</Label>
                <Input type="number" value={d.experience} onChange={(e) => update(d.id, "experience", parseInt(e.target.value) || 0)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Bio</Label>
                <Textarea value={d.bio} onChange={(e) => update(d.id, "bio", e.target.value)} className="h-16 text-xs resize-none" />
                <Label className="text-xs">Availability</Label>
                <Input value={d.availability} onChange={(e) => update(d.id, "availability", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1 flex flex-col">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">{d._count.patients} patients</Badge>
                  <Badge variant="outline" className="text-[10px]">{d._count.appointments} appts</Badge>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">Rating: {d.rating}/5</p>
                <div className="flex gap-2 mt-auto">
                  <Button size="sm" onClick={() => save(d.id)} disabled={saving === d.id} className="bg-gradient-to-r from-primary to-secondary h-7 text-xs">
                    {saving === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1" /> Save</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deactivate(d.id)} className="text-rose-600 hover:bg-rose-500/10 h-7">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function NewDietitianForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", password: "", credentials: "", specialty: "", bio: "", experience: 0,
  });
  const update = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Dr. Rohan Thapa" className="h-9" /></div>
      <div><Label className="text-xs">Email *</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="rohan@thedietitiansclinic.com" className="h-9" /></div>
      <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+977 98..." className="h-9" /></div>
      <div><Label className="text-xs">Password *</Label><Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="min 8 chars" className="h-9" /></div>
      <div><Label className="text-xs">Credentials</Label><Input value={form.credentials} onChange={(e) => update("credentials", e.target.value)} placeholder="RDN, MSc Nutrition" className="h-9" /></div>
      <div><Label className="text-xs">Specialty</Label><Input value={form.specialty} onChange={(e) => update("specialty", e.target.value)} placeholder="Diabetes & Weight Management" className="h-9" /></div>
      <div className="sm:col-span-2"><Label className="text-xs">Bio</Label><Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Brief bio..." rows={2} className="resize-none" /></div>
      <div><Label className="text-xs">Experience (years)</Label><Input type="number" value={form.experience} onChange={(e) => update("experience", parseInt(e.target.value) || 0)} className="h-9" /></div>
      <div className="sm:col-span-3 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.name || !form.email || !form.password} className="bg-gradient-to-r from-primary to-secondary">Create dietitian</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

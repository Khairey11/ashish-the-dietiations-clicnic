"use client";

import * as React from "react";
import { Plus, Save, Trash2, Loader2, Star, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Program = {
  id: string;
  slug: string;
  duration: string;
  days: number;
  price: number;
  originalPrice: number;
  tagline: string;
  features: string;
  support: string;
  accent: string;
  isPopular: boolean;
  isActive: boolean;
  sortOrder: number;
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = React.useState<Program[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/programs")
      .then((r) => r.json())
      .then((d) => { if (d.success) setPrograms(d.data); })
      .catch(() => toast.error("Failed to load programs"))
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, field: string, value: string | number | boolean) => {
    setPrograms((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
  };

  const save = async (id: string) => {
    setSaving(id);
    try {
      const program = programs.find((p) => p.id === id);
      if (!program) return;
      const res = await fetch(`/api/admin/programs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          duration: program.duration,
          days: program.days,
          price: program.price,
          originalPrice: program.originalPrice,
          tagline: program.tagline,
          features: program.features,
          support: program.support,
          isPopular: program.isPopular,
          isActive: program.isActive,
          sortOrder: program.sortOrder,
        }),
      });
      const d = await res.json();
      if (d.success) toast.success("Program updated");
      else toast.error("Update failed", { description: d.error });
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = async (id: string, current: boolean) => {
    update(id, "isActive", !current);
    await save(id);
  };

  const togglePopular = async (id: string, current: boolean) => {
    update(id, "isPopular", !current);
    await save(id);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this program? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/programs/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) {
        setPrograms((prev) => prev.filter((p) => p.id !== id));
        toast.success("Program deleted");
      } else toast.error("Delete failed");
    } catch { toast.error("Network error"); }
  };

  const addNew = async (data: any) => {
    try {
      const res = await fetch("/api/admin/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (d.success) {
        setPrograms((prev) => [...prev, d.data]);
        toast.success("Program created");
        setShowAdd(false);
      } else toast.error("Create failed", { description: d.error });
    } catch { toast.error("Network error"); }
  };

  const fmtNPR = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

  if (loading) {
    return (
      <>
        <h1 className="text-2xl font-bold mb-6">Programs</h1>
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32" />)}</div>
      </>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Programs & Pricing</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-gradient-to-r from-primary to-secondary">
          <Plus className="w-4 h-4 mr-1" /> Add program
        </Button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 rounded-2xl border border-border/40 bg-card space-y-3">
          <h3 className="text-sm font-semibold">New Program</h3>
          <NewProgramForm onSave={addNew} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="space-y-4">
        {programs.map((p) => (
          <div key={p.id} className="p-5 rounded-2xl border border-border/40 bg-card">
            <div className="grid lg:grid-cols-4 gap-4">
              {/* Duration + badges */}
              <div className="space-y-2">
                <Label className="text-xs">Duration</Label>
                <Input value={p.duration} onChange={(e) => update(p.id, "duration", e.target.value)} className="h-9 font-semibold" />
                <div className="flex items-center gap-2">
                  <button onClick={() => togglePopular(p.id, p.isPopular)} className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold", p.isPopular ? "bg-amber-500/15 text-amber-600" : "bg-muted text-muted-foreground")}>
                    <Star className={cn("w-3 h-3", p.isPopular && "fill-amber-400 text-amber-400")} /> Popular
                  </button>
                  <button onClick={() => toggleActive(p.id, p.isActive)} className={cn("flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold", p.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>
                    {p.isActive ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">/{p.slug}</p>
              </div>

              {/* Pricing */}
              <div className="space-y-2">
                <Label className="text-xs">Price (NPR)</Label>
                <Input type="number" value={p.price} onChange={(e) => update(p.id, "price", parseFloat(e.target.value) || 0)} className="h-9" />
                <Label className="text-xs">Original price (strikethrough)</Label>
                <Input type="number" value={p.originalPrice} onChange={(e) => update(p.id, "originalPrice", parseFloat(e.target.value) || 0)} className="h-9" />
                <p className="text-xs text-muted-foreground">{fmtNPR(p.price)} {p.originalPrice > 0 && <span className="line-through">{fmtNPR(p.originalPrice)}</span>}</p>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label className="text-xs">Tagline</Label>
                <Input value={p.tagline} onChange={(e) => update(p.id, "tagline", e.target.value)} className="h-9" />
                <Label className="text-xs">Days</Label>
                <Input type="number" value={p.days} onChange={(e) => update(p.id, "days", parseInt(e.target.value) || 0)} className="h-9" />
                <Label className="text-xs">Sort order</Label>
                <Input type="number" value={p.sortOrder} onChange={(e) => update(p.id, "sortOrder", parseInt(e.target.value) || 0)} className="h-9" />
              </div>

              {/* Features + actions */}
              <div className="space-y-2">
                <Label className="text-xs">Features (JSON array)</Label>
                <Textarea value={p.features} onChange={(e) => update(p.id, "features", e.target.value)} className="h-16 text-xs font-mono resize-none" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => save(p.id)} disabled={saving === p.id} className="bg-gradient-to-r from-primary to-secondary">
                    {saving === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Save className="w-3.5 h-3.5 mr-1" /> Save</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => del(p.id)} className="text-rose-600 hover:bg-rose-500/10">
                    <Trash2 className="w-3.5 h-3.5" />
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

function NewProgramForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = React.useState({
    slug: "", duration: "", days: 30, price: 0, originalPrice: 0, tagline: "",
    features: "[]", support: "[]", accent: "from-primary to-secondary",
  });
  const update = (k: string, v: string | number) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <div><Label className="text-xs">Slug *</Label><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="30-days" className="h-9 font-mono" /></div>
      <div><Label className="text-xs">Duration *</Label><Input value={form.duration} onChange={(e) => update("duration", e.target.value)} placeholder="30 Days" className="h-9" /></div>
      <div><Label className="text-xs">Days</Label><Input type="number" value={form.days} onChange={(e) => update("days", parseInt(e.target.value) || 30)} className="h-9" /></div>
      <div><Label className="text-xs">Price (NPR) *</Label><Input type="number" value={form.price} onChange={(e) => update("price", parseFloat(e.target.value) || 0)} className="h-9" /></div>
      <div><Label className="text-xs">Original price</Label><Input type="number" value={form.originalPrice} onChange={(e) => update("originalPrice", parseFloat(e.target.value) || 0)} className="h-9" /></div>
      <div><Label className="text-xs">Tagline *</Label><Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Kickstart your journey" className="h-9" /></div>
      <div className="sm:col-span-3 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.slug || !form.duration || !form.tagline} className="bg-gradient-to-r from-primary to-secondary">Create</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

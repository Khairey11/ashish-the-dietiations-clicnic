"use client";

import * as React from "react";
import { Plus, Save, Trash2, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Service = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  benefits: string;
  duration: string;
  accent: string;
  category: string;
  iconName: string;
  isActive: boolean;
  sortOrder: number;
};

export default function AdminServicesPage() {
  const [services, setServices] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/services")
      .then((r) => r.json())
      .then((d) => { if (d.success) setServices(d.data); })
      .catch(() => toast.error("Failed to load services"))
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, field: string, value: string | number | boolean) => {
    setServices((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s));
  };

  const save = async (id: string) => {
    setSaving(id);
    try {
      const service = services.find((s) => s.id === id);
      if (!service) return;
      const res = await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: service.title,
          tagline: service.tagline,
          problem: service.problem,
          solution: service.solution,
          benefits: service.benefits,
          duration: service.duration,
          isActive: service.isActive,
          sortOrder: service.sortOrder,
        }),
      });
      const d = await res.json();
      if (d.success) toast.success("Service updated");
      else toast.error("Update failed", { description: d.error });
    } catch { toast.error("Network error"); }
    finally { setSaving(null); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    update(id, "isActive", !current);
    await save(id);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    try {
      const res = await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) { setServices((prev) => prev.filter((s) => s.id !== id)); toast.success("Service deleted"); }
      else toast.error("Delete failed");
    } catch { toast.error("Network error"); }
  };

  const addNew = async (data: any) => {
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (d.success) { setServices((prev) => [...prev, d.data]); toast.success("Service created"); setShowAdd(false); }
      else toast.error("Create failed", { description: d.error });
    } catch { toast.error("Network error"); }
  };

  if (loading) return <><h1 className="text-2xl font-bold mb-6">Services</h1><div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div></>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Services</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-gradient-to-r from-primary to-secondary">
          <Plus className="w-4 h-4 mr-1" /> Add service
        </Button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 rounded-2xl border border-border/40 bg-card space-y-3">
          <h3 className="text-sm font-semibold">New Service</h3>
          <NewServiceForm onSave={addNew} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="p-4 rounded-2xl border border-border/40 bg-card">
            <div className="grid lg:grid-cols-4 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Title</Label>
                <Input value={s.title} onChange={(e) => update(s.id, "title", e.target.value)} className="h-9 font-semibold" />
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-[10px]">{s.category}</Badge>
                  <button onClick={() => toggleActive(s.id, s.isActive)} className={cn("flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold", s.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>
                    {s.isActive ? <><Eye className="w-3 h-3" /> Active</> : <><EyeOff className="w-3 h-3" /> Hidden</>}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground font-mono">/{s.slug}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tagline</Label>
                <Input value={s.tagline} onChange={(e) => update(s.id, "tagline", e.target.value)} className="h-9" />
                <Label className="text-xs">Duration</Label>
                <Input value={s.duration} onChange={(e) => update(s.id, "duration", e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Problem</Label>
                <Textarea value={s.problem} onChange={(e) => update(s.id, "problem", e.target.value)} className="h-16 text-xs resize-none" />
              </div>
              <div className="space-y-1 flex flex-col">
                <Label className="text-xs">Solution</Label>
                <Textarea value={s.solution} onChange={(e) => update(s.id, "solution", e.target.value)} className="h-16 text-xs resize-none flex-1" />
                <div className="flex gap-2 mt-1">
                  <Button size="sm" onClick={() => save(s.id)} disabled={saving === s.id} className="bg-gradient-to-r from-primary to-secondary h-7 text-xs">
                    {saving === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1" /> Save</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => del(s.id)} className="text-rose-600 hover:bg-rose-500/10 h-7">
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

function NewServiceForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = React.useState({ slug: "", title: "", tagline: "", problem: "", solution: "", duration: "Ongoing", category: "weight" });
  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <div><Label className="text-xs">Slug *</Label><Input value={form.slug} onChange={(e) => update("slug", e.target.value)} placeholder="weight-loss" className="h-9 font-mono" /></div>
      <div><Label className="text-xs">Title *</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Weight Loss Program" className="h-9" /></div>
      <div><Label className="text-xs">Category</Label>
        <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm">
          <option value="weight">Weight Management</option>
          <option value="medical">Medical Nutrition</option>
          <option value="life-stage">Life Stages</option>
          <option value="performance">Performance</option>
          <option value="corporate">Corporate</option>
        </select>
      </div>
      <div className="sm:col-span-2"><Label className="text-xs">Tagline *</Label><Input value={form.tagline} onChange={(e) => update("tagline", e.target.value)} placeholder="Sustainable fat loss without crash diets" className="h-9" /></div>
      <div><Label className="text-xs">Duration</Label><Input value={form.duration} onChange={(e) => update("duration", e.target.value)} className="h-9" /></div>
      <div className="sm:col-span-3 flex gap-2">
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.slug || !form.title || !form.tagline} className="bg-gradient-to-r from-primary to-secondary">Create</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

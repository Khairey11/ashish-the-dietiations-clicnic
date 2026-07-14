"use client";

import * as React from "react";
import { Plus, Save, Trash2, Loader2, ChevronUp, ChevronDown, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type FAQ = {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
};

export default function AdminFAQsPage() {
  const [faqs, setFAQs] = React.useState<FAQ[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState<string | null>(null);
  const [showAdd, setShowAdd] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/faqs")
      .then((r) => r.json())
      .then((d) => { if (d.success) setFAQs(d.data); })
      .catch(() => toast.error("Failed to load FAQs"))
      .finally(() => setLoading(false));
  }, []);

  const update = (id: string, field: string, value: string | number | boolean) => {
    setFAQs((prev) => prev.map((f) => f.id === id ? { ...f, [field]: value } : f));
  };

  const save = async (id: string) => {
    setSaving(id);
    try {
      const faq = faqs.find((f) => f.id === id);
      if (!faq) return;
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: faq.question, answer: faq.answer, category: faq.category, sortOrder: faq.sortOrder, isActive: faq.isActive }),
      });
      const d = await res.json();
      if (d.success) toast.success("FAQ updated");
      else toast.error("Update failed");
    } catch { toast.error("Network error"); }
    finally { setSaving(null); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    update(id, "isActive", !current);
    await save(id);
  };

  const del = async (id: string) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) { setFAQs((prev) => prev.filter((f) => f.id !== id)); toast.success("FAQ deleted"); }
    } catch { toast.error("Network error"); }
  };

  const addNew = async (data: any) => {
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, sortOrder: faqs.length }),
      });
      const d = await res.json();
      if (d.success) { setFAQs((prev) => [...prev, d.data]); toast.success("FAQ created"); setShowAdd(false); }
      else toast.error("Create failed", { description: d.error });
    } catch { toast.error("Network error"); }
  };

  if (loading) return <><h1 className="text-2xl font-bold mb-6">FAQs</h1><div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div></>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">FAQs</h1>
        <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="bg-gradient-to-r from-primary to-secondary">
          <Plus className="w-4 h-4 mr-1" /> Add FAQ
        </Button>
      </div>

      {showAdd && (
        <div className="mb-6 p-4 rounded-2xl border border-border/40 bg-card space-y-3">
          <NewFAQForm onSave={addNew} onCancel={() => setShowAdd(false)} />
        </div>
      )}

      <div className="space-y-3">
        {faqs.map((f, i) => (
          <div key={f.id} className="p-4 rounded-2xl border border-border/40 bg-card">
            <div className="flex items-start gap-3">
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[10px] font-bold text-muted-foreground">#{i + 1}</span>
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Input value={f.question} onChange={(e) => update(f.id, "question", e.target.value)} className="h-9 font-semibold" />
                  <Badge variant="outline" className="text-[10px] whitespace-nowrap">{f.category}</Badge>
                  <button onClick={() => toggleActive(f.id, f.isActive)} className={cn("px-2 py-1 rounded-md text-[10px] font-bold", f.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>
                    {f.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </button>
                </div>
                <Textarea value={f.answer} onChange={(e) => update(f.id, "answer", e.target.value)} className="text-sm resize-none" rows={2} />
                <div className="flex items-center gap-2">
                  <Label className="text-xs">Category:</Label>
                  <Input value={f.category} onChange={(e) => update(f.id, "category", e.target.value)} className="h-7 w-40 text-xs" />
                  <Button size="sm" onClick={() => save(f.id)} disabled={saving === f.id} className="bg-gradient-to-r from-primary to-secondary h-7 text-xs">
                    {saving === f.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <><Save className="w-3 h-3 mr-1" /> Save</>}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => del(f.id)} className="text-rose-600 hover:bg-rose-500/10 h-7">
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

function NewFAQForm({ onSave, onCancel }: { onSave: (data: any) => void; onCancel: () => void }) {
  const [form, setForm] = React.useState({ question: "", answer: "", category: "General" });
  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2"><Label className="text-xs">Question *</Label><Input value={form.question} onChange={(e) => update("question", e.target.value)} placeholder="Can PMOS be managed with diet alone?" className="h-9" /></div>
        <div><Label className="text-xs">Category</Label><Input value={form.category} onChange={(e) => update("category", e.target.value)} className="h-9" /></div>
      </div>
      <div><Label className="text-xs">Answer *</Label><Textarea value={form.answer} onChange={(e) => update("answer", e.target.value)} placeholder="For many women, yes — particularly with insulin-resistant PMOS..." rows={3} className="resize-none" /></div>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => onSave(form)} disabled={!form.question || !form.answer} className="bg-gradient-to-r from-primary to-secondary">Create</Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}

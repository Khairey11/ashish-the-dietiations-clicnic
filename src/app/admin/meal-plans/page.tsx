"use client";

import * as React from "react";
import { Plus, Save, Trash2, Loader2, Utensils, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MealPlan = {
  id: string;
  title: string;
  description: string | null;
  totalCalories: number | null;
  isActive: boolean;
  createdAt: string;
  patient: { user: { name: string | null; email: string } } | null;
  dietitian: { name: string } | null;
  _count: { items: number };
};

type Client = {
  id: string;
  patient?: { id: string };
  user: { name: string | null; email: string };
};

const mealTypes = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;

export default function AdminMealPlansPage() {
  const [plans, setPlans] = React.useState<MealPlan[]>([]);
  const [clients, setClients] = React.useState<Client[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showBuilder, setShowBuilder] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // Builder state
  const [selectedClient, setSelectedClient] = React.useState("");
  const [planTitle, setPlanTitle] = React.useState("");
  const [planDesc, setPlanDesc] = React.useState("");
  const [totalCal, setTotalCal] = React.useState("");
  const [proteinG, setProteinG] = React.useState("");
  const [carbsG, setCarbsG] = React.useState("");
  const [fatG, setFatG] = React.useState("");
  const [items, setItems] = React.useState<Array<{
    meal: string; name: string; calories: string; proteinG: string; carbsG: string; fatG: string; alternatives: string;
  }>>([
    { meal: "BREAKFAST", name: "", calories: "", proteinG: "", carbsG: "", fatG: "", alternatives: "" },
  ]);

  React.useEffect(() => {
    Promise.all([
      fetch("/api/admin/meal-plans").then((r) => r.json()),
      fetch("/api/admin/clients?limit=100").then((r) => r.json()),
    ])
      .then(([p, c]) => {
        if (p.success) setPlans(p.data);
        if (c.success) setClients(c.data.filter((client: any) => client.patient));
      })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  const addItem = () => {
    setItems([...items, { meal: "LUNCH", name: "", calories: "", proteinG: "", carbsG: "", fatG: "", alternatives: "" }]);
  };

  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: string, value: string) => {
    setItems(items.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const createPlan = async () => {
    if (!selectedClient || !planTitle || items.length === 0 || !items[0].name) {
      toast.error("Please fill all required fields");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/meal-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedClient,
          title: planTitle,
          description: planDesc || undefined,
          totalCalories: totalCal ? parseInt(totalCal) : undefined,
          proteinG: proteinG ? parseFloat(proteinG) : undefined,
          carbsG: carbsG ? parseFloat(carbsG) : undefined,
          fatG: fatG ? parseFloat(fatG) : undefined,
          items: items.filter((i) => i.name).map((i) => ({
            meal: i.meal,
            name: i.name,
            calories: parseInt(i.calories) || 0,
            proteinG: i.proteinG ? parseFloat(i.proteinG) : undefined,
            carbsG: i.carbsG ? parseFloat(i.carbsG) : undefined,
            fatG: i.fatG ? parseFloat(i.fatG) : undefined,
            alternatives: i.alternatives || undefined,
          })),
        }),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Meal plan created!", { description: "Client has been notified." });
        setPlans([d.data, ...plans]);
        setShowBuilder(false);
        // Reset form
        setPlanTitle(""); setPlanDesc(""); setTotalCal(""); setProteinG(""); setCarbsG(""); setFatG("");
        setItems([{ meal: "BREAKFAST", name: "", calories: "", proteinG: "", carbsG: "", fatG: "", alternatives: "" }]);
      } else {
        toast.error("Failed", { description: d.error });
      }
    } catch { toast.error("Network error"); }
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/meal-plans/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      setPlans((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !current } : p));
      toast.success(current ? "Deactivated" : "Activated");
    } catch { toast.error("Failed"); }
  };

  const del = async (id: string) => {
    if (!confirm("Delete this meal plan?")) return;
    try {
      await fetch(`/api/admin/meal-plans/${id}`, { method: "DELETE" });
      setPlans((prev) => prev.filter((p) => p.id !== id));
      toast.success("Deleted");
    } catch { toast.error("Failed"); }
  };

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (loading) return <><h1 className="text-2xl font-bold mb-6">Meal Plans</h1><div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div></>;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Meal Plans</h1>
        <Button size="sm" onClick={() => setShowBuilder(!showBuilder)} className="bg-gradient-to-r from-primary to-secondary">
          <Plus className="w-4 h-4 mr-1" /> Create plan
        </Button>
      </div>

      {/* Builder */}
      {showBuilder && (
        <div className="mb-6 p-5 rounded-2xl border border-border/40 bg-card space-y-4">
          <h3 className="text-sm font-semibold">Create New Meal Plan</h3>

          {/* Client + plan info */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Client *</Label>
              <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm">
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.patient?.id || c.id}>{c.user.name} ({c.user.email})</option>
                ))}
              </select>
            </div>
            <div>
              <Label className="text-xs">Plan title *</Label>
              <Input value={planTitle} onChange={(e) => setPlanTitle(e.target.value)} placeholder="7-Day Weight Loss Plan" className="h-9" />
            </div>
          </div>

          <div>
            <Label className="text-xs">Description</Label>
            <Input value={planDesc} onChange={(e) => setPlanDesc(e.target.value)} placeholder="High protein, low GI meal plan" className="h-9" />
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div><Label className="text-xs">Total cal</Label><Input type="number" value={totalCal} onChange={(e) => setTotalCal(e.target.value)} placeholder="1800" className="h-9" /></div>
            <div><Label className="text-xs">Protein (g)</Label><Input type="number" value={proteinG} onChange={(e) => setProteinG(e.target.value)} placeholder="120" className="h-9" /></div>
            <div><Label className="text-xs">Carbs (g)</Label><Input type="number" value={carbsG} onChange={(e) => setCarbsG(e.target.value)} placeholder="180" className="h-9" /></div>
            <div><Label className="text-xs">Fat (g)</Label><Input type="number" value={fatG} onChange={(e) => setFatG(e.target.value)} placeholder="60" className="h-9" /></div>
          </div>

          {/* Meal items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Meal Items</Label>
              <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3 h-3 mr-1" /> Add item</Button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="p-3 rounded-xl border border-border/40 bg-muted/20 space-y-2">
                <div className="flex items-center gap-2">
                  <select value={item.meal} onChange={(e) => updateItem(i, "meal", e.target.value)} className="h-8 px-2 rounded-md border border-border bg-background text-xs">
                    {mealTypes.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <Input value={item.name} onChange={(e) => updateItem(i, "name", e.target.value)} placeholder="Oatmeal with berries" className="h-8 flex-1 text-sm" />
                  <Input type="number" value={item.calories} onChange={(e) => updateItem(i, "calories", e.target.value)} placeholder="350" className="h-8 w-20 text-sm" />
                  <span className="text-xs text-muted-foreground">cal</span>
                  {items.length > 1 && <Button size="sm" variant="ghost" onClick={() => removeItem(i)} className="text-rose-600 h-8"><Trash2 className="w-3 h-3" /></Button>}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={item.proteinG} onChange={(e) => updateItem(i, "proteinG", e.target.value)} placeholder="Protein (g)" className="h-8 text-xs" />
                  <Input value={item.carbsG} onChange={(e) => updateItem(i, "carbsG", e.target.value)} placeholder="Carbs (g)" className="h-8 text-xs" />
                  <Input value={item.fatG} onChange={(e) => updateItem(i, "fatG", e.target.value)} placeholder="Fat (g)" className="h-8 text-xs" />
                </div>
                <Input value={item.alternatives} onChange={(e) => updateItem(i, "alternatives", e.target.value)} placeholder="Alternatives (e.g. swap with muesli)" className="h-8 text-xs" />
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Button onClick={createPlan} disabled={saving || !selectedClient || !planTitle} className="bg-gradient-to-r from-primary to-secondary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" /> Create & assign</>}
            </Button>
            <Button variant="ghost" onClick={() => setShowBuilder(false)}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Existing plans */}
      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-border/40 bg-card">
            <Utensils className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm font-semibold">No meal plans yet</p>
            <p className="text-xs text-muted-foreground mt-1">Create a meal plan and assign it to a client.</p>
          </div>
        ) : (
          plans.map((p) => (
            <div key={p.id} className="p-4 rounded-2xl border border-border/40 bg-card flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Utensils className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-muted-foreground">
                  {p.patient?.user?.name || "Unassigned"} · {p._count.items} items · {p.totalCalories || "—"} cal
                </p>
                <p className="text-[10px] text-muted-foreground">Created {fmtDate(p.createdAt)} by {p.dietitian?.name || "—"}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(p.id, p.isActive)} className={cn("px-2 py-1 rounded-md text-[10px] font-bold", p.isActive ? "bg-emerald-500/15 text-emerald-600" : "bg-muted text-muted-foreground")}>
                  {p.isActive ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
                <Button size="sm" variant="ghost" onClick={() => del(p.id)} className="text-rose-600 hover:bg-rose-500/10 h-7">
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { Calendar, Target, Wallet, Plus, TrendingDown, Loader2, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Measurement = {
  id: string;
  weight: number | null;
  height: number | null;
  waist: number | null;
  hip: number | null;
  bodyFat: number | null;
  muscleMass: number | null;
  measuredAt: string;
  notes: string | null;
};

type DashboardData = {
  user: { id: string; name: string | null; email: string; phone: string | null; createdAt: string } | null;
  patient: {
    id: string;
    primaryGoal: string | null;
    condition: string | null;
    startDate: string | null;
    targetWeight: number | null;
    currentWeight: number | null;
    height: number | null;
    onboardingCompleted: boolean;
  } | null;
  upcomingAppointments: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    mode: string;
    dietitian: { name: string } | null;
    service: { title: string } | null;
  }>;
  recentNotifications: Array<{
    id: string;
    type: string;
    title: string;
    body: string | null;
    createdAt: string;
    isRead: boolean;
  }>;
  activePayment: { id: string; amount: number; method: string; updatedAt: string } | null;
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [measurements, setMeasurements] = React.useState<Measurement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [todayStr, setTodayStr] = React.useState("");
  const [showAddWeight, setShowAddWeight] = React.useState(false);
  const [newWeight, setNewWeight] = React.useState("");
  const [savingWeight, setSavingWeight] = React.useState(false);

  React.useEffect(() => {
    setTodayStr(new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }));
    Promise.all([
      fetch("/api/client/dashboard").then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/dashboard"); return null; }
        return r.json();
      }),
      fetch("/api/client/measurements").then(async (r) => {
        if (r.status === 401) return { success: false };
        return r.json();
      }),
    ])
      .then(([d, m]) => {
        if (d?.success) {
          // Redirect to onboarding if not completed
          if (d.data?.patient && !d.data.patient.onboardingCompleted) {
            router.push("/dashboard/onboarding");
            return;
          }
          setData(d.data);
        }
        if (m?.success) setMeasurements(m.data);
      })
      .catch(() => setError("Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [router]);

  const saveWeight = async () => {
    if (!newWeight) return;
    setSavingWeight(true);
    try {
      const res = await fetch("/api/client/measurements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(newWeight) }),
      });
      const d = await res.json();
      if (d.success) {
        setMeasurements((prev) => [d.data, ...prev]);
        setNewWeight("");
        setShowAddWeight(false);
        toast.success("Weight logged!", { description: `${newWeight} kg recorded.` });
      } else {
        toast.error("Failed to save", { description: d.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSavingWeight(false);
    }
  };

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const fmtTime = (s: string) => new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  const fmtRelative = (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Calculate real progress
  const weightData = measurements.filter((m) => m.weight !== null).reverse();
  const startWeight = weightData[0]?.weight || data?.patient?.currentWeight || 0;
  const latestWeight = weightData[weightData.length - 1]?.weight || data?.patient?.currentWeight || 0;
  const targetWeight = data?.patient?.targetWeight || 0;
  const totalToChange = Math.abs(startWeight - targetWeight);
  const changedSoFar = Math.abs(startWeight - latestWeight);
  const progressPercent = totalToChange > 0 ? Math.min(100, Math.round((changedSoFar / totalToChange) * 100)) : 0;
  const weightChange = latestWeight - startWeight;
  const daysActive = data?.patient?.startDate ? Math.floor((Date.now() - new Date(data.patient.startDate).getTime()) / 86400000) : 0;

  // Build chart data
  const chartData = weightData.map((m) => ({
    date: fmtDate(m.measuredAt),
    weight: m.weight,
  }));

  const userName = data?.user?.name || "there";

  if (loading) {
    return (
      <>
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64 mb-6" />
      </>
    );
  }

  if (error) {
    return <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-700">{error}</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="text-xs text-muted-foreground">{todayStr}</p>
          <h1 className="text-2xl sm:text-3xl font-bold">{userName} 👋</h1>
        </div>
        {data?.upcomingAppointments && data.upcomingAppointments.length > 0 && (
          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {data.upcomingAppointments.length} upcoming
          </Badge>
        )}
      </div>

      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Current weight */}
          <div className="p-4 rounded-2xl border border-border/40 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Current weight</p>
            </div>
            <p className="text-2xl font-bold">{latestWeight ? `${latestWeight} kg` : "—"}</p>
            {weightChange !== 0 && startWeight > 0 && (
              <p className={cn("text-xs font-medium mt-1", weightChange < 0 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400")}>
                {weightChange < 0 ? "↓" : "↑"} {Math.abs(weightChange).toFixed(1)} kg since start
              </p>
            )}
          </div>

          {/* Target weight */}
          <div className="p-4 rounded-2xl border border-border/40 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Target weight</p>
            </div>
            <p className="text-2xl font-bold">{targetWeight ? `${targetWeight} kg` : "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {totalToChange > 0 ? `${Math.abs(latestWeight - targetWeight).toFixed(1)} kg to go` : "Set in assessment"}
            </p>
          </div>

          {/* Progress */}
          <div className="p-4 rounded-2xl border border-border/40 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Goal progress</p>
            </div>
            <p className="text-2xl font-bold">{progressPercent}%</p>
            <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          {/* Days active */}
          <div className="p-4 rounded-2xl border border-border/40 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Days on program</p>
            </div>
            <p className="text-2xl font-bold">{daysActive}</p>
            <p className="text-xs text-muted-foreground mt-1">Since {data?.patient?.startDate ? fmtDate(data.patient.startDate) : "—"}</p>
          </div>
        </div>

        {/* Weight chart */}
        <div className="p-5 rounded-2xl border border-border/40 bg-card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Weight Progress</h3>
              <p className="text-xs text-muted-foreground">{chartData.length} measurements recorded</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => setShowAddWeight(!showAddWeight)}>
              <Plus className="w-3.5 h-3.5 mr-1" />
              Log weight
            </Button>
          </div>

          {showAddWeight && (
            <div className="flex items-end gap-2 mb-4 p-3 rounded-xl bg-muted/30">
              <div className="space-y-1">
                <Label className="text-xs">New weight (kg)</Label>
                <Input type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="68.5" className="h-9 w-32" />
              </div>
              <Button size="sm" onClick={saveWeight} disabled={!newWeight || savingWeight} className="bg-gradient-to-r from-primary to-secondary">
                {savingWeight ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowAddWeight(false)}>Cancel</Button>
            </div>
          )}

          {chartData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 233)" vertical={false} />
                <XAxis dataKey="date" stroke="oklch(0.45 0.03 233)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.45 0.03 233)" fontSize={11} tickLine={false} axisLine={false} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.92 0.01 233)", borderRadius: "0.75rem", fontSize: "0.75rem" }} />
                {targetWeight > 0 && <ReferenceLine y={targetWeight} stroke="oklch(0.661 0.141 132.6)" strokeDasharray="4 4" label={{ value: "Target", fontSize: 10, fill: "oklch(0.661 0.141 132.6)" }} />}
                <Line type="monotone" dataKey="weight" stroke="oklch(0.699 0.134 232.8)" strokeWidth={3} dot={{ r: 4, fill: "oklch(0.699 0.134 232.8)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : chartData.length === 1 ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground mb-2">Only one measurement so far.</p>
              <p className="text-xs text-muted-foreground">Log your weight regularly to see your progress chart.</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-1">No measurements yet.</p>
              <p className="text-xs text-muted-foreground mb-3">Log your first weight to start tracking progress.</p>
              <Button size="sm" onClick={() => setShowAddWeight(true)} className="bg-gradient-to-r from-primary to-secondary">
                <Plus className="w-3.5 h-3.5 mr-1" />
                Log first weight
              </Button>
            </div>
          )}
        </div>

        {/* Two column: Appointments + Notifications */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Upcoming appointments */}
          <div className="p-5 rounded-2xl border border-border/40 bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Upcoming appointments</h3>
              <Link href="/dashboard/appointments">
                <Button variant="ghost" size="sm" className="text-xs">View all</Button>
              </Link>
            </div>
            {data?.upcomingAppointments?.length === 0 || !data?.upcomingAppointments ? (
              <div className="text-center py-8">
                <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-2">No appointments yet.</p>
                <Link href="/booking">
                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">Book consultation</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {data.upcomingAppointments.slice(0, 5).map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                    <div className="text-xs font-mono w-24 text-muted-foreground">
                      <div>{fmtDate(a.scheduledAt)}</div>
                      <div>{fmtTime(a.scheduledAt)}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{a.service?.title || "Consultation"}</p>
                      <p className="text-xs text-muted-foreground">{a.dietitian?.name || "—"}</p>
                    </div>
                    <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-muted text-muted-foreground">{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent notifications */}
          <div className="p-5 rounded-2xl border border-border/40 bg-card">
            <h3 className="text-sm font-semibold mb-4">Recent notifications</h3>
            {data?.recentNotifications?.length === 0 || !data?.recentNotifications ? (
              <p className="text-sm text-muted-foreground text-center py-8">No notifications yet.</p>
            ) : (
              <div className="space-y-2">
                {data.recentNotifications.slice(0, 5).map((n) => (
                  <div key={n.id} className={cn("flex items-start gap-3 p-3 rounded-xl", !n.isRead && "bg-primary/5")}>
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Activity className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold">{n.title}</p>
                      {n.body && <p className="text-[11px] text-muted-foreground mt-0.5">{n.body}</p>}
                    </div>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">{fmtRelative(n.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Measurement history */}
        {measurements.length > 0 && (
          <div className="p-5 rounded-2xl border border-border/40 bg-card">
            <h3 className="text-sm font-semibold mb-4">Measurement History</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium">Date</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium">Weight</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium hidden sm:table-cell">Waist</th>
                    <th className="text-right py-2 px-3 text-muted-foreground font-medium hidden sm:table-cell">Body Fat</th>
                    <th className="text-left py-2 px-3 text-muted-foreground font-medium hidden md:table-cell">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {measurements.slice(0, 10).map((m) => (
                    <tr key={m.id} className="border-b border-border/20">
                      <td className="py-2 px-3">{fmtDate(m.measuredAt)}</td>
                      <td className="py-2 px-3 text-right font-medium">{m.weight ? `${m.weight} kg` : "—"}</td>
                      <td className="py-2 px-3 text-right hidden sm:table-cell">{m.waist ? `${m.waist} cm` : "—"}</td>
                      <td className="py-2 px-3 text-right hidden sm:table-cell">{m.bodyFat ? `${m.bodyFat}%` : "—"}</td>
                      <td className="py-2 px-3 hidden md:table-cell text-muted-foreground">{m.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  LayoutDashboard, Users, CalendarDays, CreditCard, FileText,
  Megaphone, Star, Settings, Search, Bell, TrendingUp, DollarSign,
  UserPlus, Clock, ChevronRight, Activity, Wallet, ArrowUpRight,
  ArrowDownRight, LogOut, Plus, Download, Loader2, ShieldCheck,
} from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const revenueData = [
  { month: "Jan", revenue: 145000, target: 130000 },
  { month: "Feb", revenue: 162000, target: 145000 },
  { month: "Mar", revenue: 178000, target: 160000 },
  { month: "Apr", revenue: 195000, target: 175000 },
  { month: "May", revenue: 220000, target: 195000 },
  { month: "Jun", revenue: 248000, target: 215000 },
];

const programData = [
  { name: "30-day", value: 142, color: "oklch(0.62 0.18 145)" },
  { name: "60-day", value: 218, color: "oklch(0.7 0.17 145)" },
  { name: "90-day", value: 312, color: "oklch(0.65 0.16 230)" },
  { name: "180-day", value: 168, color: "oklch(0.78 0.16 90)" },
  { name: "365-day", value: 84, color: "oklch(0.55 0.2 280)" },
];

const leadSourceData = [
  { source: "Organic", count: 145 },
  { source: "Referral", count: 98 },
  { source: "Social", count: 76 },
  { source: "Direct", count: 62 },
  { source: "Ads", count: 41 },
];

const sidebarItems: Array<{
  icon: typeof LayoutDashboard;
  label: string;
  active?: boolean;
  href: string;
  badge?: string;
}> = [
  { icon: LayoutDashboard, label: "Overview", active: true, href: "/admin" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
  { icon: CalendarDays, label: "Appointments", href: "/admin/appointments" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: Star, label: "Testimonials", href: "/admin/testimonials" },
  { icon: Bell, label: "Newsletter", href: "/admin/newsletter" },
  { icon: ShieldCheck, label: "Audit Log", href: "/admin/audit-log" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

const recentActivity = [
  { icon: UserPlus, color: "text-emerald-600 dark:text-emerald-400", text: "New client registered", sub: "Bishal T. · 60-day program", time: "5m ago" },
  { icon: Wallet, color: "text-sky-600 dark:text-sky-400", text: "Payment received", sub: "Rs. 5,499 · Sneha K.", time: "12m ago" },
  { icon: CalendarDays, color: "text-violet-600 dark:text-violet-400", text: "Appointment booked", sub: "Anita S. · Thu 10AM", time: "32m ago" },
  { icon: Star, color: "text-amber-600 dark:text-amber-400", text: "New testimonial", sub: "5-star from Prakash R.", time: "1h ago" },
];

const upcomingAppointments = [
  { time: "10:00 AM", client: "Sneha K.", dietitian: "Dr. Anita S.", type: "Video", initials: "SK", accent: "from-pink-500 to-rose-500" },
  { time: "11:30 AM", client: "Bishal T.", dietitian: "Priya G.", type: "In-clinic", initials: "BT", accent: "from-sky-500 to-blue-500" },
  { time: "01:00 PM", client: "Anjali M.", dietitian: "Meera R.", type: "Video", initials: "AM", accent: "from-rose-500 to-pink-500" },
  { time: "02:30 PM", client: "Prakash R.", dietitian: "Dr. Rohan T.", type: "In-clinic", initials: "PR", accent: "from-cyan-500 to-blue-500" },
  { time: "04:00 PM", client: "Rekha S.", dietitian: "Dr. Anita S.", type: "Video", initials: "RS", accent: "from-violet-500 to-purple-500" },
];

export default function AdminPage() {
  const [stats, setStats] = React.useState<null | {
    totalRevenue: number;
    todayAppointments: number;
    pendingLeads: number;
    totalClients: number;
    totalAppointments: number;
    activeDietitians: number;
    publishedBlogPosts: number;
    approvedTestimonials: number;
    activePrograms: number;
    newClientsThisMonth: number;
    revenueByMonth: Array<{ month: string; revenue: number; target: number }>;
    programData: Array<{ name: string; value: number; color: string }>;
    leadSourceData: Array<{ source: string; count: number }>;
    recentActivity: Array<{
      id: string;
      action: string;
      entity: string;
      createdAt: string;
      user: { name: string | null } | null;
    }>;
  }>(null);
  const [leads, setLeads] = React.useState<Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
    service: string | null;
    status: string;
    createdAt: string;
  }>>([]);
  const [todayAppts, setTodayAppts] = React.useState<Array<{
    id: string;
    scheduledAt: string;
    status: string;
    mode: string;
    client: { name: string | null } | null;
    dietitian: { name: string } | null;
  }>>([]);
  const [loading, setLoading] = React.useState(true);
  const [todayStr, setTodayStr] = React.useState("");

  React.useEffect(() => {
    setTodayStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    );
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      fetch("/api/admin/stats").then((r) => r.json()),
      fetch("/api/admin/leads?limit=10").then((r) => r.json()),
      fetch(`/api/admin/appointments?date=${today}&limit=20`).then((r) => r.json()),
    ])
      .then(([s, l, a]) => {
        if (s.success) setStats(s.data);
        if (l.success) setLeads(l.data);
        if (a.success) setTodayAppts(a.data);
      })
      .catch(() => {
        // Silent fail — admin page still shows fallback mock charts
      })
      .finally(() => setLoading(false));
  }, []);

  const updateLeadStatus = async (id: string, status: string) => {
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json();
      if (data.success) {
        setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
        toast.success("Lead updated", { description: `Marked as ${status.toLowerCase()}` });
      } else {
        toast.error("Update failed", { description: data.error });
      }
    } catch {
      toast.error("Update failed", { description: "Network error" });
    }
  };

  const fmtNPR = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

  const exportLeadsCsv = () => {
    if (leads.length === 0) {
      toast.error("No leads to export");
      return;
    }
    const header = "Name,Email,Phone,Service,Status,Created\n";
    const rows = leads
      .map((l) =>
        [
          `"${l.name}"`,
          `"${l.email}"`,
          `"${l.phone || ""}"`,
          `"${l.service || ""}"`,
          `"${l.status}"`,
          `"${new Date(l.createdAt).toISOString()}"`,
        ].join(",")
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Exported", { description: `${leads.length} leads downloaded.` });
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Top bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Portal</h1>
                <Badge className="bg-primary/15 text-primary border-0">Super Admin</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{todayStr || ""} · Welcome back, Aarav</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border/60 text-xs">
                <Search className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Search everything...</span>
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">⌘K</kbd>
              </div>
              <Button variant="outline" size="sm" onClick={exportLeadsCsv}>
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export
              </Button>
              <Link href="/booking">
                <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  New appointment
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:flex lg:col-span-2 flex-col gap-1 p-4 rounded-2xl border border-border/60 bg-card h-fit sticky top-24">
              <div className="flex items-center gap-2 px-2 py-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">Admin Portal</p>
                  <p className="text-[10px] text-muted-foreground">v2.4.1</p>
                </div>
              </div>
              {sidebarItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    item.active
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span className={cn(
                      "px-1.5 py-0.5 rounded text-[9px] font-bold",
                      item.active ? "bg-white/20" : "bg-primary/15 text-primary"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-border/40">
                <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                  <LogOut className="w-3.5 h-3.5" />
                  Back to site
                </Link>
              </div>
            </aside>

            {/* Main content */}
            <div className="lg:col-span-10 space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: DollarSign, label: "Total Revenue", value: stats ? fmtNPR(stats.totalRevenue) : null, change: stats ? `${stats.activePrograms} active programs` : null, trend: "up", accent: "from-emerald-500 to-teal-500" },
                  { icon: CalendarDays, label: "Today's appts", value: stats ? String(stats.todayAppointments) : null, change: stats ? `${stats.totalAppointments} total` : null, trend: "up", accent: "from-sky-500 to-blue-500" },
                  { icon: UserPlus, label: "Pending leads", value: stats ? String(stats.pendingLeads) : null, change: "Action needed", trend: "down", accent: "from-amber-500 to-orange-500" },
                  { icon: Users, label: "Active clients", value: stats ? stats.totalClients.toLocaleString() : null, change: stats ? `+${stats.newClientsThisMonth} this month` : null, trend: "up", accent: "from-violet-500 to-purple-500" },
                ].map((k) => (
                  <div key={k.label} className="p-4 rounded-2xl border border-border/40 bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center", k.accent)}>
                        <k.icon className="w-4 h-4 text-white" />
                      </div>
                      {k.change && (
                        <div className={cn(
                          "flex items-center gap-0.5 text-[10px] font-semibold",
                          k.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                        )}>
                          {k.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {k.change}
                        </div>
                      )}
                    </div>
                    {loading ? (
                      <Skeleton className="h-7 w-20 mb-1" />
                    ) : (
                      <p className="text-2xl font-bold tracking-tight">{k.value ?? "—"}</p>
                    )}
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                  </div>
                ))}
              </div>

              {/* Charts row */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold">Revenue vs target</h3>
                      <p className="text-xs text-muted-foreground">Last 6 months · in NPR</p>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-muted-foreground">Revenue</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                        <span className="text-muted-foreground">Target</span>
                      </span>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={stats?.revenueByMonth || []} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="oklch(0.62 0.18 145 / 0.4)" />
                          <stop offset="100%" stopColor="oklch(0.62 0.18 145 / 0)" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 150)" vertical={false} />
                      <XAxis dataKey="month" stroke="oklch(0.45 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="oklch(0.45 0.03 150)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                      <Tooltip
                        contentStyle={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.92 0.01 150)", borderRadius: "0.75rem", fontSize: "0.75rem" }}
                        formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, ""]}
                      />
                      <Area type="monotone" dataKey="target" stroke="oklch(0.65 0.03 150)" strokeDasharray="4 4" strokeWidth={2} fill="none" />
                      <Area type="monotone" dataKey="revenue" stroke="oklch(0.62 0.18 145)" strokeWidth={3} fill="url(#revGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="p-5 rounded-2xl border border-border/40 bg-card">
                  <h3 className="text-sm font-semibold mb-1">Program mix</h3>
                  <p className="text-xs text-muted-foreground mb-4">Active subscriptions</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie data={stats?.programData || []} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
                        {(stats?.programData || []).map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.92 0.01 150)", borderRadius: "0.75rem", fontSize: "0.75rem" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-1.5 mt-3">
                    {(stats?.programData || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground col-span-2 text-center py-2">No paid programs yet.</p>
                    ) : (
                      (stats?.programData || []).map((p) => (
                        <div key={p.name} className="flex items-center gap-1.5 text-[11px]">
                          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                          <span className="text-muted-foreground">{p.name}</span>
                          <span className="font-semibold ml-auto">{p.value}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Today's schedule + activity */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold">Today&apos;s schedule</h3>
                      <p className="text-xs text-muted-foreground">
                        {todayAppts.length} appointment{todayAppts.length === 1 ? "" : "s"} today
                      </p>
                    </div>
                    <Link href="/admin/appointments">
                      <Button variant="ghost" size="sm" className="text-xs">
                        View all <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                      ))}
                    </div>
                  ) : todayAppts.length === 0 ? (
                    <div className="text-center py-10 text-sm text-muted-foreground">
                      No appointments scheduled for today.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todayAppts.map((a) => {
                        const d = new Date(a.scheduledAt);
                        const time = d.toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        });
                        const initials = (a.client?.name || "?")
                          .split(" ")
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase();
                        return (
                          <div key={a.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors">
                            <div className="text-xs font-mono font-semibold w-20 text-muted-foreground">
                              {time}
                            </div>
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold">{a.client?.name || "Client"}</p>
                              <p className="text-xs text-muted-foreground">
                                {a.dietitian?.name || "—"} · {a.mode === "VIDEO" ? "Video" : "In-clinic"}
                              </p>
                            </div>
                            <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-muted text-muted-foreground">
                              {a.status}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold">Recent activity</h3>
                    <Link href="/admin/audit-log">
                      <Button variant="ghost" size="sm" className="text-xs h-7">
                        View all <ChevronRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </div>
                  {(stats?.recentActivity || []).length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      No admin actions yet.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {(stats?.recentActivity || []).map((a) => (
                        <div key={a.id} className="flex items-start gap-3">
                          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Activity className="w-3.5 h-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold">
                              {a.action.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
                            </p>
                            <p className="text-[11px] text-muted-foreground truncate">
                              {a.user?.name || "System"} · {a.entity}
                            </p>
                          </div>
                          <span className="text-[10px] text-muted-foreground flex-shrink-0">
                            {new Date(a.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Lead sources + quick actions */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold">Recent leads</h3>
                      <p className="text-xs text-muted-foreground">Latest 10 inquiries from the contact form</p>
                    </div>
                  </div>
                  {loading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                      ))}
                    </div>
                  ) : leads.length === 0 ? (
                    <div className="text-center py-12 text-sm text-muted-foreground">
                      No leads yet. New inquiries from the contact form will appear here.
                    </div>
                  ) : (
                    <div className="rounded-lg border border-border/40 overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Name</TableHead>
                            <TableHead className="text-xs hidden sm:table-cell">Service</TableHead>
                            <TableHead className="text-xs hidden md:table-cell">Received</TableHead>
                            <TableHead className="text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {leads.map((lead) => (
                            <TableRow key={lead.id}>
                              <TableCell className="text-xs">
                                <div className="font-semibold">{lead.name}</div>
                                <div className="text-muted-foreground">{lead.email}</div>
                              </TableCell>
                              <TableCell className="text-xs hidden sm:table-cell">
                                {lead.service || "—"}
                              </TableCell>
                              <TableCell className="text-xs hidden md:table-cell text-muted-foreground">
                                {new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </TableCell>
                              <TableCell>
                                <select
                                  value={lead.status}
                                  onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                                  className={cn(
                                    "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border-0 cursor-pointer",
                                    lead.status === "NEW" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                                    lead.status === "CONTACTED" && "bg-sky-500/15 text-sky-600 dark:text-sky-400",
                                    lead.status === "QUALIFIED" && "bg-violet-500/15 text-violet-600 dark:text-violet-400",
                                    lead.status === "BOOKED" && "bg-primary/15 text-primary",
                                    lead.status === "CONVERTED" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                                    lead.status === "LOST" && "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                  )}
                                >
                                  <option value="NEW">New</option>
                                  <option value="CONTACTED">Contacted</option>
                                  <option value="QUALIFIED">Qualified</option>
                                  <option value="BOOKED">Booked</option>
                                  <option value="CONVERTED">Converted</option>
                                  <option value="LOST">Lost</option>
                                </select>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                <div className="p-5 rounded-2xl border border-border/40 bg-card">
                  <h3 className="text-sm font-semibold mb-4">Quick actions</h3>
                  <div className="space-y-2">
                    {[
                      { icon: CalendarDays, label: "New appointment", href: "/booking" },
                      { icon: CreditCard, label: "Payment settings", href: "/admin/settings" },
                      { icon: Star, label: "Review testimonials", href: "/admin/testimonials" },
                      { icon: Users, label: "View clients", href: "/admin/clients" },
                      { icon: Megaphone, label: "Visit blog", href: "/blog" },
                      { icon: Settings, label: "Settings", href: "/admin/settings" },
                    ].map((a) => (
                      <Link
                        key={a.label}
                        href={a.href}
                        className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left"
                      >
                        <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                          <a.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="text-xs font-medium">{a.label}</span>
                        <ChevronRight className="w-3.5 h-3.5 ml-auto text-muted-foreground" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

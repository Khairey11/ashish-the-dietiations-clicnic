"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  CreditCard,
  FileText,
  Megaphone,
  Star,
  Settings,
  Search,
  Bell,
  TrendingUp,
  DollarSign,
  UserPlus,
  Clock,
  ChevronRight,
  Activity,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

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

const sidebarItems = [
  { icon: LayoutDashboard, label: "Overview", active: true },
  { icon: Users, label: "Clients", badge: "1.2k" },
  { icon: CalendarDays, label: "Appointments" },
  { icon: UserPlus, label: "Leads", badge: "12" },
  { icon: FileText, label: "Diet Plans" },
  { icon: CreditCard, label: "Payments" },
  { icon: Megaphone, label: "Blog CMS" },
  { icon: Star, label: "Testimonials" },
  { icon: Settings, label: "Settings" },
];

export function AdminPortal() {
  return (
    <SectionWrapper id="admin" className="bg-background relative overflow-hidden">
      <SectionHeader
        eyebrow="Operator experience"
        title={
          <>
            Run your entire clinic from{" "}
            <span className="gradient-text">one intelligent dashboard</span>
          </>
        }
        description="A purpose-built admin portal for dietitians, receptionists and managers. Manage clients, appointments, diet plans, payments and content — without ever switching tabs."
      />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mt-12 rounded-3xl border border-border/60 bg-card shadow-premium overflow-hidden"
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40 bg-muted/40">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <div className="flex-1 max-w-md mx-auto px-3 py-1 rounded-md bg-background/60 text-center text-xs text-muted-foreground">
            app.nutriaplus.health/admin
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">
              Super Admin
            </span>
          </div>
        </div>

        <div className="grid grid-cols-12 min-h-[640px]">
          {/* Sidebar */}
          <aside className="hidden lg:flex col-span-2 flex-col gap-1 p-4 border-r border-border/40 bg-muted/20">
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
              <button
                key={item.label}
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
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-10 p-5 sm:p-6 space-y-5">
            {/* Top bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-muted-foreground">Tuesday, June 29, 2026</p>
                <h3 className="text-xl font-bold">Welcome back, Aarav</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 text-xs">
                  <Search className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Search everything...</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-background text-[10px] font-mono">⌘K</kbd>
                </div>
                <button className="relative w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
                </button>
              </div>
            </div>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: DollarSign, label: "Revenue (MTD)", value: "Rs. 2.48L", change: "+12.8%", trend: "up", accent: "from-emerald-500 to-teal-500" },
                { icon: CalendarDays, label: "Today's appts", value: "34", change: "+5 vs avg", trend: "up", accent: "from-sky-500 to-blue-500" },
                { icon: UserPlus, label: "Pending leads", value: "12", change: "-3 from yesterday", trend: "down", accent: "from-amber-500 to-orange-500" },
                { icon: Users, label: "Active clients", value: "1,247", change: "+42 this month", trend: "up", accent: "from-violet-500 to-purple-500" },
              ].map((k, i) => (
                <motion.div
                  key={k.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-4 rounded-2xl border border-border/40 bg-background"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center", k.accent)}>
                      <k.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className={cn(
                      "flex items-center gap-0.5 text-[10px] font-semibold",
                      k.trend === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                    )}>
                      {k.trend === "up" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {k.change}
                    </div>
                  </div>
                  <p className="text-2xl font-bold tracking-tight">{k.value}</p>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Revenue chart */}
              <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-background">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold">Revenue vs target</h4>
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
                  <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
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
                      contentStyle={{
                        background: "oklch(1 0 0)",
                        border: "1px solid oklch(0.92 0.01 150)",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                      formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, ""]}
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="oklch(0.65 0.03 150)"
                      strokeDasharray="4 4"
                      strokeWidth={2}
                      fill="none"
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="oklch(0.62 0.18 145)"
                      strokeWidth={3}
                      fill="url(#revGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Program distribution pie */}
              <div className="p-5 rounded-2xl border border-border/40 bg-background">
                <h4 className="text-sm font-semibold mb-1">Program mix</h4>
                <p className="text-xs text-muted-foreground mb-4">Active subscriptions</p>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={programData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {programData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "oklch(1 0 0)",
                        border: "1px solid oklch(0.92 0.01 150)",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-1.5 mt-3">
                  {programData.map((p) => (
                    <div key={p.name} className="flex items-center gap-1.5 text-[11px]">
                      <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
                      <span className="text-muted-foreground">{p.name}</span>
                      <span className="font-semibold ml-auto">{p.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom row: lead sources + activity */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Lead sources */}
              <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-background">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold">Lead sources</h4>
                    <p className="text-xs text-muted-foreground">Last 30 days</p>
                  </div>
                  <button className="text-xs font-semibold text-primary flex items-center gap-1">
                    View report <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={leadSourceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 150)" vertical={false} />
                    <XAxis dataKey="source" stroke="oklch(0.45 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="oklch(0.45 0.03 150)" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: "oklch(0.97 0.01 150)" }}
                      contentStyle={{
                        background: "oklch(1 0 0)",
                        border: "1px solid oklch(0.92 0.01 150)",
                        borderRadius: "0.75rem",
                        fontSize: "0.75rem",
                      }}
                    />
                    <Bar dataKey="count" fill="oklch(0.62 0.18 145)" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Recent activity */}
              <div className="p-5 rounded-2xl border border-border/40 bg-background">
                <h4 className="text-sm font-semibold mb-4">Recent activity</h4>
                <div className="space-y-3">
                  {[
                    { icon: UserPlus, color: "text-emerald-600 dark:text-emerald-400", text: "New client registered", sub: "Bishal T. · 60-day program", time: "5m ago" },
                    { icon: Wallet, color: "text-sky-600 dark:text-sky-400", text: "Payment received", sub: "Rs. 5,499 · Sneha K.", time: "12m ago" },
                    { icon: CalendarDays, color: "text-violet-600 dark:text-violet-400", text: "Appointment booked", sub: "Anita S. · Thu 10AM", time: "32m ago" },
                    { icon: Star, color: "text-amber-600 dark:text-amber-400", text: "New testimonial", sub: "5-star from Prakash R.", time: "1h ago" },
                  ].map((a, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-muted/60 flex items-center justify-center flex-shrink-0">
                        <a.icon className={cn("w-3.5 h-3.5", a.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{a.text}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{a.sub}</p>
                      </div>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0">{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 flex-wrap pt-2">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mr-2">Quick actions:</span>
              {["+ New appointment", "+ Create diet plan", "+ Add lead", "+ Send invoice", "+ Publish blog"].map((a) => (
                <button
                  key={a}
                  className="px-3 py-1.5 rounded-lg bg-muted/60 hover:bg-muted text-xs font-medium transition-colors"
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Feature highlights */}
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Users, title: "Client CRM", desc: "360° profiles with medical history, goals, photos, payments" },
          { icon: FileText, title: "Diet Plan Builder", desc: "Reusable templates, macro tracking, PDF export" },
          { icon: CalendarDays, title: "Smart Scheduling", desc: "Calendar sync, recurring sessions, auto-reminders" },
          { icon: TrendingUp, title: "Analytics & Reports", desc: "Revenue, conversion, retention — export to CSV/PDF" },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="p-5 rounded-2xl border border-border/60 bg-card hover:shadow-premium transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
              <f.icon className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-sm font-semibold mb-1">{f.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

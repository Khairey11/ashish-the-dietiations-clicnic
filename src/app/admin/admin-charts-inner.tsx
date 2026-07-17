"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

export type AdminChartsInnerProps = {
  revenueData: Array<{ month: string; revenue: number; target: number }>;
  programData: Array<{ name: string; value: number; color: string }>;
  leadSourceData: Array<{ source: string; count: number }>;
};

export function AdminChartsInner({ revenueData, programData, leadSourceData }: AdminChartsInnerProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-4">
      {/* Revenue vs target */}
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
          <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.699 0.134 232.8 / 0.4)" />
                <stop offset="100%" stopColor="oklch(0.699 0.134 232.8 / 0)" />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.01 233)" vertical={false} />
            <XAxis dataKey="month" stroke="oklch(0.45 0.03 233)" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="oklch(0.45 0.03 233)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip
              contentStyle={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.92 0.01 233)", borderRadius: "0.75rem", fontSize: "0.75rem" }}
              formatter={(v: number) => [`Rs. ${v.toLocaleString()}`, ""]}
            />
            <Area type="monotone" dataKey="target" stroke="oklch(0.55 0.18 255 / 0.5)" strokeDasharray="4 4" strokeWidth={2} fill="none" />
            <Area type="monotone" dataKey="revenue" stroke="oklch(0.699 0.134 232.8)" strokeWidth={3} fill="url(#revGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Program mix */}
      <div className="p-5 rounded-2xl border border-border/40 bg-card">
        <h3 className="text-sm font-semibold mb-1">Program mix</h3>
        <p className="text-xs text-muted-foreground mb-4">Active subscriptions</p>
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie data={programData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={2} dataKey="value">
              {programData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: "oklch(1 0 0)", border: "1px solid oklch(0.92 0.01 233)", borderRadius: "0.75rem", fontSize: "0.75rem" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-1.5 mt-3">
          {programData.length === 0 ? (
            <p className="text-xs text-muted-foreground col-span-2 text-center py-2">No paid programs yet.</p>
          ) : (
            programData.map((p) => (
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
  );
}

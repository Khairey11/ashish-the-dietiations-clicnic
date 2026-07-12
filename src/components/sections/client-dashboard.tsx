"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  TrendingDown,
  Calendar,
  MessageCircle,
  Bell,
  Settings,
  Apple,
  Activity,
  Camera,
  FileText,
  CreditCard,
  Home,
  ChevronRight,
  Flame,
  Droplets,
  Moon,
  Footprints,
  CheckCircle2,
} from "lucide-react";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: Calendar, label: "Appointments" },
  { icon: Apple, label: "Meal Plans" },
  { icon: Activity, label: "Progress" },
  { icon: Camera, label: "Photos" },
  { icon: FileText, label: "Reports" },
  { icon: MessageCircle, label: "Messages" },
  { icon: CreditCard, label: "Payments" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
];

export function ClientDashboard() {
  return (
    <SectionWrapper id="dashboard" className="bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-mesh rounded-full opacity-20 blur-3xl pointer-events-none" />

      <SectionHeader
        eyebrow="Client experience"
        title={
          <>
            Your entire health journey,{" "}
            <span className="gradient-text">in one beautiful dashboard</span>
          </>
        }
        description="Track every metric that matters. Message your dietitian. Adjust your meal plan. Review your labs. All in one place — accessible from any device."
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
            app.thedietitiansclinic.com/dashboard
          </div>
        </div>

        <div className="grid grid-cols-12 min-h-[600px]">
          {/* Sidebar */}
          <aside className="hidden lg:flex col-span-2 flex-col gap-1 p-4 border-r border-border/40 bg-muted/20">
            <div className="flex items-center gap-2 px-2 py-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                SK
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">Sneha K.</p>
                <p className="text-[10px] text-muted-foreground">Premium member</p>
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
                {item.label}
                {item.label === "Messages" && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-rose-500" />
                )}
              </button>
            ))}
          </aside>

          {/* Main content */}
          <div className="col-span-12 lg:col-span-10 p-5 sm:p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-xs text-muted-foreground">Good morning, Sneha 👋</p>
                <h3 className="text-xl font-bold">Your transformation dashboard</h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  On track · Day 47 of 90
                </div>
                <button className="w-9 h-9 rounded-lg bg-muted/60 flex items-center justify-center hover:bg-muted transition-colors">
                  <Bell className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { icon: TrendingDown, label: "Weight lost", value: "10.8 kg", change: "-1.2 kg this week", color: "text-emerald-600 dark:text-emerald-400" },
                { icon: Flame, label: "Calories today", value: "1,000", change: "/ 1,700 kcal", color: "text-primary" },
                { icon: Footprints, label: "Steps", value: "8,420", change: "+12% vs avg", color: "text-sky-600 dark:text-sky-400" },
                { icon: Droplets, label: "Water", value: "1.8 L", change: "/ 2.5 L goal", color: "text-cyan-600 dark:text-cyan-400" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="p-4 rounded-2xl border border-border/40 bg-background"
                >
                  <div className="flex items-center justify-between mb-2">
                    <s.icon className={cn("w-4 h-4", s.color)} />
                    <span className="text-[10px] text-muted-foreground">{s.change}</span>
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Charts + side panels */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Weight chart */}
              <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-background">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold">Weight trend</h4>
                    <p className="text-xs text-muted-foreground">Last 16 weeks</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                      -10.8 kg
                    </span>
                  </div>
                </div>
                <svg viewBox="0 0 400 160" className="w-full h-40">
                  <defs>
                    <linearGradient id="dashLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="oklch(0.62 0.18 145)" />
                      <stop offset="100%" stopColor="oklch(0.65 0.16 230)" />
                    </linearGradient>
                    <linearGradient id="dashFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.18 145 / 0.3)" />
                      <stop offset="100%" stopColor="oklch(0.62 0.18 145 / 0)" />
                    </linearGradient>
                  </defs>
                  {/* Grid */}
                  {[0, 40, 80, 120, 160].map((y) => (
                    <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="oklch(0.92 0.01 150)" strokeWidth="1" />
                  ))}
                  <path
                    d="M0,20 C50,30 80,40 120,55 C160,70 200,80 240,95 C280,110 320,120 400,130 L400,160 L0,160 Z"
                    fill="url(#dashFill)"
                  />
                  <path
                    d="M0,20 C50,30 80,40 120,55 C160,70 200,80 240,95 C280,110 320,120 400,130"
                    stroke="url(#dashLine)"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                  />
                  {/* Goal line */}
                  <line x1="0" y1="140" x2="400" y2="140" stroke="oklch(0.65 0.16 230)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
                  <text x="380" y="135" textAnchor="end" fontSize="10" fill="oklch(0.45 0.03 150)">Goal 62kg</text>
                  <circle cx="400" cy="130" r="5" fill="oklch(0.62 0.18 145)" />
                  <circle cx="400" cy="130" r="10" fill="oklch(0.62 0.18 145 / 0.3)" />
                </svg>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-xs">
                  <span className="text-muted-foreground">Start: 78.0 kg</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">Current: 67.2 kg</span>
                  <span className="text-muted-foreground">Goal: 62.0 kg</span>
                </div>
              </div>

              {/* Next appointment */}
              <div className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 to-secondary/5">
                <h4 className="text-sm font-semibold mb-3">Next appointment</h4>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">
                    AS
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Dr. Anita Shrestha</p>
                    <p className="text-xs text-muted-foreground">PCOS & Hormonal Health</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/60">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-semibold">Thu, Jul 2</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/60">
                    <span className="text-muted-foreground">Time</span>
                    <span className="font-semibold">10:00 AM</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-background/60">
                    <span className="text-muted-foreground">Mode</span>
                    <span className="font-semibold">Video call</span>
                  </div>
                </div>
                <button className="mt-4 w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
                  Join call
                </button>
              </div>
            </div>

            {/* Today's plan + measurements */}
            <div className="grid lg:grid-cols-3 gap-4">
              {/* Today's meal plan */}
              <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-background">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="text-sm font-semibold">Today&apos;s meal plan</h4>
                    <p className="text-xs text-muted-foreground">1,700 kcal · 145g protein</p>
                  </div>
                  <button className="text-xs font-semibold text-primary flex items-center gap-1">
                    Swap meal <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { meal: "Breakfast", food: "Oats & berries", cal: 420, done: true },
                    { meal: "Lunch", food: "Chicken bowl", cal: 580, done: true },
                    { meal: "Snack", food: "Greek yogurt", cal: 180, done: false },
                    { meal: "Dinner", food: "Salmon & quinoa", cal: 520, done: false },
                  ].map((m) => (
                    <div
                      key={m.meal}
                      className={cn(
                        "p-3 rounded-xl border transition-colors",
                        m.done
                          ? "border-primary/30 bg-primary/5"
                          : "border-border/40 bg-background"
                      )}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        {m.done ? (
                          <CheckCircle2 className="w-3 h-3 text-primary" />
                        ) : (
                          <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />
                        )}
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {m.meal}
                        </span>
                      </div>
                      <p className="text-xs font-semibold">{m.food}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.cal} kcal</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Measurements */}
              <div className="p-5 rounded-2xl border border-border/40 bg-background">
                <h4 className="text-sm font-semibold mb-3">Measurements</h4>
                <div className="space-y-2.5">
                  {[
                    { label: "Waist", value: "78 cm", change: "-6 cm" },
                    { label: "Hip", value: "96 cm", change: "-4 cm" },
                    { label: "Chest", value: "92 cm", change: "-3 cm" },
                    { label: "Body fat", value: "24%", change: "-5%" },
                  ].map((m) => (
                    <div key={m.label} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{m.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{m.value}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{m.change}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border/30">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Moon className="w-3.5 h-3.5 text-primary" />
                    <span>Sleep avg: <span className="font-semibold text-foreground">7h 12m</span></span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  );
}

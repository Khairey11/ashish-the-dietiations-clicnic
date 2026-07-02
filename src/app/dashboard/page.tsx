"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home, Calendar, Apple, Activity, Camera, FileText, MessageCircle,
  CreditCard, Bell, Settings, LogOut, TrendingDown, Flame, Droplets,
  Moon, Footprints, CheckCircle2, ChevronRight, Star, Plus, Send,
} from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const sidebarItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: Calendar, label: "Appointments" },
  { icon: Apple, label: "Meal Plans" },
  { icon: Activity, label: "Progress" },
  { icon: Camera, label: "Photos" },
  { icon: FileText, label: "Reports" },
  { icon: MessageCircle, label: "Messages", badge: 2 },
  { icon: CreditCard, label: "Payments" },
  { icon: Bell, label: "Notifications" },
  { icon: Settings, label: "Settings" },
];

const messages = [
  { from: "Dr. Anita Shrestha", initials: "AS", accent: "from-pink-500 to-rose-500", text: "Great progress this week, Sneha! Your fasting glucose is down 8 points. Keep up the morning walks.", time: "2h ago", unread: true },
  { from: "Care Team", initials: "CT", accent: "from-emerald-500 to-teal-500", text: "Your next appointment is confirmed for Thursday at 10:00 AM. Video link will be sent 15 minutes before.", time: "1d ago" },
];

export default function DashboardPage() {
  const [activeNav, setActiveNav] = React.useState("Dashboard");
  const [messageText, setMessageText] = React.useState("");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <h1 className="text-2xl sm:text-3xl font-bold">Sneha Karki 👋</h1>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                On track · Day 47 of 90
              </Badge>
              <Button variant="outline" size="sm">
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Sign out
              </Button>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Sidebar */}
            <aside className="hidden lg:flex lg:col-span-2 flex-col gap-1 p-4 rounded-2xl border border-border/60 bg-card h-fit sticky top-24">
              <div className="flex items-center gap-2 px-2 py-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">SK</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">Sneha K.</p>
                  <p className="text-[10px] text-muted-foreground">Premium · 90-day</p>
                </div>
              </div>
              {sidebarItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveNav(item.label)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    item.label === activeNav
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                  {item.badge && (
                    <span className={cn(
                      "ml-auto px-1.5 py-0.5 rounded text-[9px] font-bold",
                      item.label === activeNav ? "bg-white/20" : "bg-primary/15 text-primary"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </button>
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
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { icon: TrendingDown, label: "Weight lost", value: "10.8 kg", change: "-1.2 kg this week", color: "text-emerald-600 dark:text-emerald-400" },
                  { icon: Flame, label: "Calories today", value: "1,000", change: "/ 1,700 kcal", color: "text-primary" },
                  { icon: Footprints, label: "Steps", value: "8,420", change: "+12% vs avg", color: "text-sky-600 dark:text-sky-400" },
                  { icon: Droplets, label: "Water", value: "1.8 L", change: "/ 2.5 L goal", color: "text-cyan-600 dark:text-cyan-400" },
                ].map((s) => (
                  <div key={s.label} className="p-4 rounded-2xl border border-border/40 bg-card">
                    <div className="flex items-center justify-between mb-2">
                      <s.icon className={cn("w-4 h-4", s.color)} />
                      <span className="text-[10px] text-muted-foreground">{s.change}</span>
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Weight chart + next appointment */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold">Weight trend</h3>
                      <p className="text-xs text-muted-foreground">Last 16 weeks</p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0">-10.8 kg</Badge>
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
                    {[0, 40, 80, 120, 160].map((y) => (
                      <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="oklch(0.92 0.01 150)" strokeWidth="1" />
                    ))}
                    <path d="M0,20 C50,30 80,40 120,55 C160,70 200,80 240,95 C280,110 320,120 400,130 L400,160 L0,160 Z" fill="url(#dashFill)" />
                    <path d="M0,20 C50,30 80,40 120,55 C160,70 200,80 240,95 C280,110 320,120 400,130" stroke="url(#dashLine)" strokeWidth="3" fill="none" strokeLinecap="round" />
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

                <div className="p-5 rounded-2xl border border-border/40 bg-gradient-to-br from-primary/5 to-secondary/5">
                  <h3 className="text-sm font-semibold mb-3">Next appointment</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold">AS</div>
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
                  <Button className="mt-4 w-full bg-gradient-to-r from-primary to-secondary" size="sm">Join call</Button>
                </div>
              </div>

              {/* Meal plan + measurements */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-5 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-sm font-semibold">Today&apos;s meal plan</h3>
                      <p className="text-xs text-muted-foreground">1,700 kcal · 145g protein</p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-xs">Swap meal <ChevronRight className="w-3 h-3" /></Button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { meal: "Breakfast", food: "Oats & berries", cal: 420, done: true },
                      { meal: "Lunch", food: "Chicken bowl", cal: 580, done: true },
                      { meal: "Snack", food: "Greek yogurt", cal: 180, done: false },
                      { meal: "Dinner", food: "Salmon & quinoa", cal: 520, done: false },
                    ].map((m) => (
                      <div key={m.meal} className={cn("p-3 rounded-xl border", m.done ? "border-primary/30 bg-primary/5" : "border-border/40")}>
                        <div className="flex items-center gap-1.5 mb-1">
                          {m.done ? <CheckCircle2 className="w-3 h-3 text-primary" /> : <div className="w-3 h-3 rounded-full border-2 border-muted-foreground/30" />}
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{m.meal}</span>
                        </div>
                        <p className="text-xs font-semibold">{m.food}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">{m.cal} kcal</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-border/40 bg-card">
                  <h3 className="text-sm font-semibold mb-3">Measurements</h3>
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

              {/* Messages */}
              <div className="p-5 rounded-2xl border border-border/40 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold">Messages from your care team</h3>
                  <Badge variant="outline" className="text-[10px]">2 new</Badge>
                </div>
                <div className="space-y-3 mb-4">
                  {messages.map((m, i) => (
                    <div key={i} className={cn("flex items-start gap-3 p-3 rounded-xl", m.unread ? "bg-primary/5" : "bg-muted/40")}>
                      <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-xs font-bold flex-shrink-0", m.accent)}>
                        {m.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{m.from}</p>
                          <span className="text-[10px] text-muted-foreground">{m.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{m.text}</p>
                      </div>
                      {m.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    placeholder="Reply to your dietitian..."
                    className="h-10"
                  />
                  <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

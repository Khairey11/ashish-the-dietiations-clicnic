"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Play,
  ShieldCheck,
  Star,
  Activity,
  TrendingDown,
  Calendar,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const trustBadges = [
  { icon: ShieldCheck, label: "HIPAA-aligned" },
  { icon: Stethoscope, label: "RDN-credentialed" },
  { icon: Star, label: "4.9/5 · 1,200+ reviews" },
];

const liveStats = [
  { label: "Active clients today", value: "348", change: "+12%" },
  { label: "Consultations this week", value: "1,205", change: "+8%" },
  { label: "Avg. weight lost (90d)", value: "8.4 kg", change: "+0.6 kg" },
];

export function Hero() {
  const [todayStr, setTodayStr] = React.useState("");
  React.useEffect(() => {
    setTodayStr(
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      })
    );
  }, []);

  return (
    <section
      id="top"
      className="relative pt-32 sm:pt-36 lg:pt-40 pb-20 lg:pb-28 overflow-hidden bg-mesh"
    >
      {/* Background grid */}
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />

      {/* Floating orbs */}
      <div className="absolute top-20 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" />
      <div
        className="absolute top-40 right-0 w-96 h-96 bg-accent/15 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left content */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-7"
          >
            <motion.h1
              variants={item}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.05] text-balance"
            >
              Nutrition that
              <br />
              <span className="gradient-text">actually transforms</span>
              <br />
              your health.
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed text-balance"
            >
              Personalized diet consultations, with evidence-based meal plans and
              continuous progress tracking — all on one intelligent platform.
              Lose weight, reverse metabolic conditions, and build habits that
              last a lifetime.
            </motion.p>

            <motion.div
              variants={item}
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-3"
            >
              <Link href="/booking" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="shimmer-btn bg-gradient-to-r from-primary to-secondary hover:shadow-glow text-base h-12 px-6 w-full sm:w-auto"
                >
                  Start your free consultation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/programs" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base h-12 px-6 glass border-border/40 w-full sm:w-auto"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Explore programs
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              {trustBadges.map((badge) => (
                <div
                  key={badge.label}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <badge.icon className="w-4 h-4 text-primary" />
                  <span className="font-medium">{badge.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right visual — premium dashboard preview card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative">
              {/* Main card */}
              <div className="glass rounded-3xl p-6 shadow-premium border-border/30">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">
                      Today · {todayStr || "—"}
                    </p>
                    <h3 className="text-lg font-semibold">Your progress</h3>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                    <TrendingDown className="w-3.5 h-3.5" />
                    On track
                  </div>
                </div>

                {/* Weight chart */}
                <div className="rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/5 p-4 mb-4">
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Current weight</p>
                      <p className="text-2xl font-bold">
                        67.2 <span className="text-sm text-muted-foreground font-medium">kg</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Goal</p>
                      <p className="text-sm font-semibold">62 kg</p>
                    </div>
                  </div>
                  <svg viewBox="0 0 200 50" className="w-full h-12">
                    <defs>
                      <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="oklch(0.699 0.134 232.8)" />
                        <stop offset="100%" stopColor="oklch(0.55 0.18 255)" />
                      </linearGradient>
                      <linearGradient id="heroFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="oklch(0.699 0.134 232.8 / 0.3)" />
                        <stop offset="100%" stopColor="oklch(0.699 0.134 232.8 / 0)" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,35 L20,32 L40,30 L60,28 L80,24 L100,22 L120,18 L140,15 L160,12 L180,10 L200,8 L200,50 L0,50 Z"
                      fill="url(#heroFill)"
                    />
                    <path
                      d="M0,35 L20,32 L40,30 L60,28 L80,24 L100,22 L120,18 L140,15 L160,12 L180,10 L200,8"
                      stroke="url(#heroLine)"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <circle cx="200" cy="8" r="4" fill="oklch(0.55 0.18 255)" />
                    <circle cx="200" cy="8" r="8" fill="oklch(0.55 0.18 255 / 0.3)" />
                  </svg>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                    -10.8 kg in 16 weeks
                  </p>
                </div>

                {/* Today's plan */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Today&apos;s plan
                  </p>
                  {[
                    { meal: "Breakfast", cal: "420 kcal", done: true, time: "Oats & berries" },
                    { meal: "Lunch", cal: "580 kcal", done: true, time: "Grilled chicken bowl" },
                    { meal: "Snack", cal: "180 kcal", done: false, time: "Greek yogurt" },
                    { meal: "Dinner", cal: "520 kcal", done: false, time: "Salmon & quinoa" },
                  ].map((meal) => (
                    <div
                      key={meal.meal}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors"
                    >
                      <div
                        className={`w-2 h-2 rounded-full ${
                          meal.done ? "bg-primary" : "bg-muted-foreground/30"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{meal.meal}</p>
                        <p className="text-xs text-muted-foreground truncate">{meal.time}</p>
                      </div>
                      <span className="text-xs font-mono text-muted-foreground">
                        {meal.cal}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Calorie ring */}
                <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Calories today</p>
                    <p className="text-lg font-bold">
                      1,000 <span className="text-xs text-muted-foreground font-medium">/ 1,700 kcal</span>
                    </p>
                  </div>
                  <div className="relative w-14 h-14">
                    <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                      <circle cx="18" cy="18" r="14" fill="none" stroke="oklch(0.92 0.01 233)" strokeWidth="3" />
                      <circle
                        cx="18"
                        cy="18"
                        r="14"
                        fill="none"
                        stroke="oklch(0.699 0.134 232.8)"
                        strokeWidth="3"
                        strokeDasharray={`${0.59 * 88} 88`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                      59%
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute -left-4 sm:-left-8 top-1/3 glass rounded-2xl p-3 shadow-premium hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                    <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Blood sugar</p>
                    <p className="text-sm font-bold">92 mg/dL</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="absolute -right-4 sm:-right-6 bottom-12 glass rounded-2xl p-3 shadow-premium hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-sky-500/15 flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Next check-in</p>
                    <p className="text-sm font-bold">Thu · 10:00 AM</p>
                  </div>
                </div>
              </motion.div>

              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl -z-10 rounded-3xl" />
            </div>
          </motion.div>
        </div>

        {/* Live stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-16 lg:mt-24 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {liveStats.map((stat) => (
            <div
              key={stat.label}
              className="glass rounded-2xl p-5 flex items-center justify-between"
            >
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                {stat.change}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

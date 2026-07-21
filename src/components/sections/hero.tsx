"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  Apple,
  MessageSquare,
  TrendingDown,
  Heart,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  { icon: Stethoscope, label: "Online & In-person Consultations" },
  { icon: ShieldCheck, label: "Evidence-Based Care" },
  { icon: Apple, label: "Personalized Meal Plans" },
  { icon: MessageSquare, label: "Ongoing Support" },
];

export function Hero() {

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
              Eat Better.
              <br />
              <span className="gradient-text">Live Healthier.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed text-balance"
            >
              Personalized nutrition care designed around you. Expert guidance for
              weight management, diabetes, PCOS, heart health, and more — backed by
              science and built around your life.
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
                  Book Consultation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/services" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base h-12 px-6 glass border-border/40 w-full sm:w-auto"
                >
                  Explore Services
                  <ArrowRight className="w-4 h-4 ml-2" />
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

          {/* Right visual — nutrition-themed illustration (no photo) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            <div className="relative">
              {/* Healthy plate illustration */}
              <div className="relative glass rounded-3xl p-8 shadow-premium border-border/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Healthy Plate Method</p>
                    <h3 className="text-lg font-semibold">Balanced nutrition</h3>
                  </div>
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    <Heart className="w-3.5 h-3.5" />
                    Science-based
                  </div>
                </div>

                {/* Plate SVG */}
                <div className="flex justify-center mb-6">
                  <svg viewBox="0 0 200 200" className="w-48 h-48">
                    {/* Plate outline */}
                    <circle cx="100" cy="100" r="90" fill="none" stroke="oklch(0.92 0.01 145)" strokeWidth="2" />
                    <circle cx="100" cy="100" r="85" fill="oklch(0.99 0.005 145)" />

                    {/* Vegetables section (top-left, green) */}
                    <path d="M 100 100 L 100 15 A 85 85 0 0 0 15 100 Z" fill="oklch(0.62 0.18 145 / 0.15)" />
                    <text x="55" y="60" fontSize="9" fill="oklch(0.45 0.12 145)" fontWeight="600" textAnchor="middle">Vegetables</text>
                    <text x="55" y="72" fontSize="7" fill="oklch(0.5 0.1 145)" textAnchor="middle">½ plate</text>

                    {/* Proteins section (top-right, amber) */}
                    <path d="M 100 100 L 185 100 A 85 85 0 0 0 100 15 Z" fill="oklch(0.75 0.15 65 / 0.12)" />
                    <text x="145" y="60" fontSize="9" fill="oklch(0.55 0.13 65)" fontWeight="600" textAnchor="middle">Proteins</text>
                    <text x="145" y="72" fontSize="7" fill="oklch(0.55 0.1 65)" textAnchor="middle">¼ plate</text>

                    {/* Carbs section (bottom-right, teal) */}
                    <path d="M 100 100 L 100 185 A 85 85 0 0 0 185 100 Z" fill="oklch(0.7 0.13 180 / 0.12)" />
                    <text x="145" y="135" fontSize="9" fill="oklch(0.5 0.12 180)" fontWeight="600" textAnchor="middle">Whole Grains</text>
                    <text x="145" y="147" fontSize="7" fill="oklch(0.5 0.1 180)" textAnchor="middle">¼ plate</text>

                    {/* Fruits section (bottom-left, lighter green) */}
                    <path d="M 100 100 L 15 100 A 85 85 0 0 0 100 185 Z" fill="oklch(0.7 0.15 130 / 0.1)" />
                    <text x="55" y="135" fontSize="9" fill="oklch(0.5 0.12 130)" fontWeight="600" textAnchor="middle">Fruits</text>
                    <text x="55" y="147" fontSize="7" fill="oklch(0.5 0.1 130)" textAnchor="middle">Side</text>

                    {/* Center circle */}
                    <circle cx="100" cy="100" r="20" fill="white" stroke="oklch(0.92 0.01 145)" strokeWidth="1.5" />
                    <text x="100" y="98" fontSize="7" fill="oklch(0.45 0.03 145)" textAnchor="middle" fontWeight="600">Water</text>
                    <text x="100" y="108" fontSize="6" fill="oklch(0.55 0.02 145)" textAnchor="middle">+ Dairy</text>
                  </svg>
                </div>

                {/* Key metrics */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 rounded-xl bg-primary/5">
                    <p className="text-lg font-bold text-primary">500+</p>
                    <p className="text-[10px] text-muted-foreground">Clients helped</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-primary/5">
                    <p className="text-lg font-bold text-primary">8.4kg</p>
                    <p className="text-[10px] text-muted-foreground">Avg. weight lost</p>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-primary/5">
                    <p className="text-lg font-bold text-primary">97%</p>
                    <p className="text-[10px] text-muted-foreground">Satisfaction</p>
                  </div>
                </div>
              </div>

              {/* Floating cards */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9, duration: 0.6 }}
                className="absolute -left-4 sm:-left-6 top-1/4 glass rounded-2xl p-3 shadow-premium hidden sm:block"
              >
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
                    <TrendingDown className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Weight loss</p>
                    <p className="text-sm font-bold">-10.8 kg</p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1, duration: 0.6 }}
                className="absolute -right-4 sm:-right-6 bottom-20 glass rounded-2xl p-3 shadow-premium hidden sm:block"
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

              {/* Glow */}
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-accent/10 blur-2xl -z-10 rounded-3xl" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

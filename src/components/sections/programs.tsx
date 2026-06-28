"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight, Zap, Crown } from "lucide-react";
import { programs } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

export function Programs() {
  const formatPrice = (n: number) => `Rs. ${n.toLocaleString()}`;

  return (
    <SectionWrapper id="programs" className="bg-muted/30">
      <SectionHeader
        eyebrow="Programs & Pricing"
        title={
          <>
            Choose your{" "}
            <span className="gradient-text">transformation timeline</span>
          </>
        }
        description="From a 30-day kickstart to a full year of concierge wellness, every program includes 1:1 coaching, personalised meal plans and progress tracking."
      />

      {/* Cards */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {programs.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className={cn(
              "relative rounded-2xl bg-card border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-premium flex flex-col",
              p.popular
                ? "border-primary shadow-glow ring-2 ring-primary/30"
                : "border-border/60"
            )}
          >
            {p.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground gap-1 shadow-glow">
                  <Star className="w-3 h-3 fill-current" />
                  Most popular
                </Badge>
              </div>
            )}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex items-start justify-between mb-1">
                <span className="text-2xl font-bold">{p.duration}</span>
                {p.days >= 365 ? (
                  <Crown className="w-5 h-5 text-amber-500" />
                ) : p.days >= 90 ? (
                  <Zap className="w-5 h-5 text-primary" />
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground mb-4">{p.tagline}</p>

              <div className="mb-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold tracking-tight">
                    {formatPrice(p.price)}
                  </span>
                  <span className="text-xs text-muted-foreground line-through">
                    {formatPrice(p.originalPrice)}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  ≈ Rs. {Math.round(p.price / p.days)}/day
                </p>
              </div>

              <div className="space-y-2 mb-4 flex-1">
                {p.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-xs">
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-foreground/80">{f}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-border/40 mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Support
                </p>
                <div className="space-y-1">
                  {p.support.map((s) => (
                    <p key={s} className="text-[11px] text-foreground/70">
                      · {s}
                    </p>
                  ))}
                </div>
              </div>

              <Button
                onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
                variant={p.popular ? "default" : "outline"}
                className={cn(
                  "w-full",
                  p.popular && "bg-gradient-to-r from-primary to-secondary"
                )}
              >
                Get started
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Comparison table */}
      <div className="mt-16">
        <h3 className="text-2xl font-bold text-center mb-2">
          Compare programs side by side
        </h3>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Every program includes a money-back guarantee within the first 14 days.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-border/60 bg-muted/40">
                <th className="text-left p-4 text-sm font-semibold">Feature</th>
                {programs.map((p) => (
                  <th
                    key={p.id}
                    className={cn(
                      "p-4 text-sm font-semibold text-center min-w-[140px]",
                      p.popular && "bg-primary/5"
                    )}
                  >
                    {p.duration}
                    {p.popular && (
                      <span className="block text-[10px] text-primary mt-0.5">
                        ★ Most popular
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { label: "Price", getValue: (p) => formatPrice(p.price) },
                { label: "Per-day cost", getValue: (p) => `Rs. ${Math.round(p.price / p.days)}` },
                { label: "1:1 consultations", getValue: (p) => p.days <= 30 ? "1 session" : p.days <= 60 ? "3 sessions" : p.days <= 90 ? "6 sessions" : p.days <= 180 ? "Bi-weekly" : "Unlimited" },
                { label: "Personalised meal plan", getValue: () => "✓", all: true },
                { label: "Body composition analysis", getValue: () => "✓", all: true },
                { label: "Recipe library access", getValue: () => "✓", all: true },
                { label: "WhatsApp support", getValue: (p) => p.days <= 30 ? "5 days/wk" : p.days <= 60 ? "6 days/wk" : "7 days/wk" },
                { label: "Macro adjustments", getValue: (p) => p.days >= 60 ? "✓" : "—" },
                { label: "Progress photo tracking", getValue: (p) => p.days >= 60 ? "✓" : "—" },
                { label: "CGM integration", getValue: (p) => p.days >= 90 ? "✓" : "—" },
                { label: "Lab review & adjustments", getValue: (p) => p.days >= 90 ? "✓" : "—" },
                { label: "Sleep & stress coaching", getValue: (p) => p.days >= 90 ? "✓" : "—" },
                { label: "Family access", getValue: (p) => p.days >= 365 ? "Up to 3" : "—" },
                { label: "Concierge support", getValue: (p) => p.days >= 365 ? "24/7" : "—" },
                { label: "Money-back guarantee", getValue: () => "14 days", all: true },
              ].map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="p-4 text-muted-foreground">{row.label}</td>
                  {programs.map((p) => (
                    <td
                      key={p.id}
                      className={cn(
                        "p-4 text-center",
                        p.popular && "bg-primary/5",
                        row.getValue(p) === "✓" && "text-primary font-semibold",
                        row.getValue(p) === "—" && "text-muted-foreground/40"
                      )}
                    >
                      {row.getValue(p)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionWrapper>
  );
}

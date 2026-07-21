"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Star, ArrowRight, Zap, Crown } from "lucide-react";
import { programs as staticPrograms, type Program } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

export function Programs({ programs = staticPrograms }: { programs?: Program[] }) {

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

              <Link href="/pricing" className="block">
                <Button
                  variant={p.popular ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    p.popular && "bg-gradient-to-r from-primary to-secondary"
                  )}
                >
                  View Pricing
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* View pricing CTA */}
      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground mb-4">
          Every program includes a 14-day money-back guarantee.
        </p>
        <Link href="/pricing">
          <Button variant="outline" size="lg">
            View Detailed Pricing
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    </SectionWrapper>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote, TrendingDown, TrendingUp, ArrowRight } from "lucide-react";
import { testimonials as staticTestimonials, type Testimonial } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

const filters = [
  { id: "all", label: "All Stories" },
  { id: "weight-loss", label: "Weight Loss" },
  { id: "pcos", label: "PMOS" },
  { id: "diabetes", label: "Diabetes" },
  { id: "pregnancy", label: "Pregnancy" },
  { id: "thyroid", label: "Thyroid" },
  { id: "sports", label: "Sports" },
];

export function Testimonials({ testimonials = staticTestimonials }: { testimonials?: Testimonial[] }) {
  const [active, setActive] = React.useState("all");

  const filtered = React.useMemo(() => {
    if (active === "all") return testimonials;
    return testimonials.filter((t) => t.tag === active);
  }, [active, testimonials]);

  return (
    <SectionWrapper id="testimonials" className="bg-muted/30">
      <SectionHeader
        eyebrow="Real transformations"
        title={
          <>
            Results that{" "}
            <span className="gradient-text">speak for themselves</span>
          </>
        }
        description="12,400+ clients have transformed their health with The Dietitian's Clinic. Here are a few of their stories — unfiltered, verified, and tracked through our platform."
      />

      {/* Filters */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              active === f.id
                ? "bg-primary text-primary-foreground shadow-glow"
                : "bg-background/60 text-muted-foreground hover:bg-background hover:text-foreground"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((t, i) => (
            <TestimonialCard key={t.id} t={t} delay={i * 0.05} />
          ))}
        </AnimatePresence>
      </div>

      {/* Aggregate ratings banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { platform: "Google Reviews", rating: "4.9", count: "847" },
          { platform: "Trustpilot", rating: "4.8", count: "412" },
          { platform: "Practo", rating: "4.9", count: "329" },
          { platform: "Facebook", rating: "4.9", count: "276" },
        ].map((r) => (
          <div
            key={r.platform}
            className="rounded-2xl bg-card border border-border/60 p-5 text-center"
          >
            <div className="flex items-center justify-center gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="w-4 h-4 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-2xl font-bold">{r.rating}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {r.count} reviews on {r.platform}
            </p>
          </div>
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

function TestimonialCard({ t, delay }: { t: Testimonial; delay: number }) {
  const isLoss = t.beforeWeight > t.afterWeight;
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3, delay }}
      className="group rounded-2xl bg-card border border-border/60 p-6 hover:shadow-premium transition-all duration-300 flex flex-col"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                "w-3.5 h-3.5",
                s <= t.rating
                  ? "fill-amber-400 text-amber-400"
                  : "text-muted-foreground/30"
              )}
            />
          ))}
        </div>
        <Quote className="w-5 h-5 text-primary/30" />
      </div>

      <p className="text-sm text-foreground/90 leading-relaxed flex-1 italic">
        &ldquo;{t.quote}&rdquo;
      </p>

      {/* Before/After */}
      <div className="mt-5 grid grid-cols-2 gap-2 mb-4">
        <div className="rounded-xl bg-muted/50 p-3 text-center">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Before</p>
          <p className="text-lg font-bold">{t.beforeWeight}<span className="text-xs text-muted-foreground"> kg</span></p>
        </div>
        <div className="rounded-xl bg-primary/10 p-3 text-center">
          <p className="text-[10px] text-primary uppercase tracking-wider font-semibold">After</p>
          <p className="text-lg font-bold text-primary">{t.afterWeight}<span className="text-xs text-primary/70"> kg</span></p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 mb-4">
        {isLoss ? (
          <TrendingDown className="w-4 h-4 text-primary" />
        ) : (
          <TrendingUp className="w-4 h-4 text-primary" />
        )}
        <span className="text-sm font-semibold text-primary">{t.highlight}</span>
        <span className="ml-auto text-xs text-muted-foreground">{t.duration}</span>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border/40">
        <div
          className={cn(
            "w-10 h-10 rounded-full bg-gradient-to-br flex items-center justify-center text-white text-sm font-bold",
            t.accent
          )}
        >
          {t.initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{t.name}</p>
          <p className="text-xs text-muted-foreground">
            {t.age} yrs · {t.city} · {t.condition}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

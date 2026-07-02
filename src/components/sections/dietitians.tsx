"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star, Clock, Globe, ArrowRight, Award, Sparkles } from "lucide-react";
import { dietitians } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

export function Dietitians() {
  return (
    <SectionWrapper id="dietitians" className="bg-muted/30">
      <SectionHeader
        eyebrow="Meet the team"
        title={
          <>
            World-class clinicians who{" "}
            <span className="gradient-text">actually care</span>
          </>
        }
        description="Every The Dietitian's Clinic dietitian is RDN-credentialed, regularly peer-reviewed, and trained in motivational interviewing. You're not just getting a meal plan — you're getting a partner."
      />

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {dietitians.map((d, i) => (
          <motion.div
            key={d.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group relative rounded-2xl bg-card border border-border/60 overflow-hidden hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300"
          >
            {/* Header */}
            <div className={cn("relative h-28 bg-gradient-to-br", d.accent)}>
              <div className="absolute inset-0 bg-grid opacity-30" />
              <div className="absolute top-3 right-3">
                <Badge className="bg-background/30 backdrop-blur text-foreground border-0 gap-1">
                  <Award className="w-3 h-3" />
                  {d.experience}+ yrs
                </Badge>
              </div>
            </div>

            {/* Avatar */}
            <div className="relative px-5 pb-5 -mt-12">
              <div
                className={cn(
                  "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold mb-3 border-4 border-card shadow-premium",
                  d.accent
                )}
              >
                {d.initials}
              </div>

              <h3 className="text-lg font-semibold leading-tight">{d.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{d.credentials}</p>
              <p className="text-sm font-semibold text-primary mt-2">{d.specialty}</p>

              {/* Focus tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {d.focus.map((f) => (
                  <span
                    key={f}
                    className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground"
                  >
                    {f}
                  </span>
                ))}
              </div>

              {/* Bio */}
              <p className="text-xs text-muted-foreground/90 leading-relaxed mt-3 line-clamp-3">
                {d.bio}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/40">
                <div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-bold">{d.rating}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{d.reviews} reviews</p>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-primary" />
                    <span className="text-[11px] font-semibold">{d.languages.length}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">languages</p>
                </div>
              </div>

              {/* Availability */}
              <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                <span className="relative flex w-2 h-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                  <span className="relative rounded-full bg-emerald-500 w-2 h-2" />
                </span>
                <span className="text-muted-foreground">{d.availability}</span>
              </div>

              {/* CTA */}
              <Button
                onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
                variant="outline"
                size="sm"
                className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
              >
                Book with {d.name.split(" ")[d.name.split(" ").length - 1]}
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-12 rounded-3xl bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-glow"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Not sure who to book with?</h3>
            <p className="text-sm text-white/80">
              Get matched in 60 seconds based on your goals & history.
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
          className="bg-white text-primary hover:bg-white/90"
        >
          Find my dietitian
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </motion.div>
    </SectionWrapper>
  );
}

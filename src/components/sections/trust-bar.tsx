"use client";

import { motion } from "framer-motion";
import { Award, Users, TrendingUp, ShieldCheck } from "lucide-react";
import { stats } from "@/lib/data";
import { AnimatedNumber } from "./section-utils";

const certifications = [
  "Academy of Nutrition & Dietetics",
  "Indian Dietetic Association",
  "Nepal Health Professional Council",
  "ISO 27001 Certified",
  "HIPAA Aligned",
  "GDPR Compliant",
];

export function TrustBar() {
  return (
    <section className="py-12 lg:py-16 border-y border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                {[Award, Users, TrendingUp, ShieldCheck][i] &&
                  (() => {
                    const Icon = [Award, Users, TrendingUp, ShieldCheck][i];
                    return <Icon className="w-5 h-5 text-primary" />;
                  })()}
                <p className="text-3xl lg:text-4xl font-bold tracking-tight">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </p>
              </div>
              <p className="text-sm font-semibold">{stat.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Certifications marquee */}
        <div className="relative overflow-hidden">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-4">
            Trusted & certified by
          </p>
          <div className="flex gap-12 animate-marquee whitespace-nowrap">
            {[...certifications, ...certifications].map((cert, i) => (
              <span
                key={i}
                className="text-sm font-semibold text-muted-foreground/80 tracking-wide"
              >
                {cert}
              </span>
            ))}
          </div>
          {/* Gradient masks */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-muted/30 to-transparent pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  );
}

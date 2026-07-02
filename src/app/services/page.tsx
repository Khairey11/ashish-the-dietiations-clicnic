"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { services } from "@/lib/data";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All Services" },
  { id: "weight", label: "Weight Management" },
  { id: "medical", label: "Medical Nutrition" },
  { id: "life-stage", label: "Life Stages" },
  { id: "performance", label: "Performance" },
  { id: "corporate", label: "Corporate" },
];

export default function ServicesPage() {
  const [active, setActive] = React.useState("all");

  const filtered = React.useMemo(() => {
    if (active === "all") return services;
    return services.filter((s) => s.category === active);
  }, [active]);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Our services"
        title={<>Specialised programs for <span className="gradient-text">every body</span> and every goal</>}
        description="Twelve evidence-based service tracks led by RDN-credentialed clinicians. Choose a category or browse all services below — each link takes you to a detailed page with problem, solution, process, FAQs and booking."
      />

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActive(cat.id)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  active === cat.id
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((service, i) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Link
                  href={`/services/${service.slug}`}
                  className="group block h-full rounded-2xl border border-border/60 bg-card p-6 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 overflow-hidden relative"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", service.accent)} />
                  <div className="relative">
                    <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4", service.accent)}>
                      <service.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{service.tagline}</p>
                    <p className="text-sm text-muted-foreground/80 line-clamp-2 mb-4">{service.problem}</p>
                    <div className="space-y-1.5 mb-4">
                      {service.benefits.slice(0, 2).map((b) => (
                        <div key={b} className="flex items-start gap-1.5 text-xs">
                          <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">{b}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-border/40">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {service.duration}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                        View details
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

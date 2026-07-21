"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check, Clock, X } from "lucide-react";
import { services, type Service } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

const categories = [
  { id: "all", label: "All Services" },
  { id: "weight", label: "Weight Management" },
  { id: "medical", label: "Medical Nutrition" },
  { id: "life-stage", label: "Life Stages" },
  { id: "performance", label: "Performance" },
  { id: "corporate", label: "Corporate" },
];

export function Services() {
  const [active, setActive] = React.useState("all");
  const [selected, setSelected] = React.useState<Service | null>(null);

  const filtered = React.useMemo(() => {
    if (active === "all") return services;
    return services.filter((s) => s.category === active);
  }, [active]);

  return (
    <SectionWrapper id="services" className="bg-background">
      <SectionHeader
        eyebrow="What we treat"
        title={
          <>
            Specialised programs for{" "}
            <span className="gradient-text">every body</span> and every goal
          </>
        }
        description="Twelve evidence-based service tracks led by RDN-credentialed clinicians. From weight management to medical nutrition therapy, we have a path designed for you."
      />

      {/* Category filter */}
      <div className="mt-10 flex flex-wrap justify-center gap-2">
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
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map((service, i) => (
            <motion.button
              key={service.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              onClick={() => setSelected(service)}
              className="group relative text-left rounded-2xl border border-border/60 bg-card p-6 hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative">
                <div
                  className={cn(
                    "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4 group-hover:scale-110 transition-transform",
                    service.accent
                  )}
                >
                  <service.icon className="w-6 h-6 text-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-1">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{service.tagline}</p>
                <p className="text-sm text-muted-foreground/80 line-clamp-3 mb-4">{service.problem}</p>
                <div className="flex items-center justify-between pt-4 border-t border-border/40">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {service.duration}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:gap-2 transition-all">
                    Learn more
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Detail modal */}
      <ServiceModal
        service={selected}
        onClose={() => setSelected(null)}
        onBook={() => {
          setSelected(null);
          document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </SectionWrapper>
  );
}

function ServiceModal({
  service,
  onClose,
  onBook,
}: {
  service: Service | null;
  onClose: () => void;
  onBook: () => void;
}) {
  return (
    <AnimatePresence>
      {service && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6"
        >
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glass rounded-3xl shadow-premium"
          >
            <div
              className={cn(
                "relative p-6 sm:p-8 bg-gradient-to-br",
                service.accent
              )}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-background/40 backdrop-blur flex items-center justify-center hover:bg-background/60 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-background/40 backdrop-blur flex items-center justify-center mb-4">
                <service.icon className="w-7 h-7 text-foreground" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-1">{service.title}</h2>
              <p className="text-muted-foreground">{service.tagline}</p>
            </div>

            <div className="p-6 sm:p-8 space-y-6">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  The problem
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {service.problem}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Our solution
                </h4>
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {service.solution}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Key benefits
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.benefits.map((b) => (
                    <div key={b} className="flex items-start gap-2 text-sm">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-muted/50">
                <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Typical duration</p>
                  <p className="text-sm font-semibold">{service.duration}</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onBook}
                  className="flex-1 bg-gradient-to-r from-primary to-secondary"
                >
                  Book this consultation
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Explore other services
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

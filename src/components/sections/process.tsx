"use client";

import { motion } from "framer-motion";
import { processSteps } from "@/lib/data";
import { SectionHeader, SectionWrapper } from "./section-utils";

export function Process() {
  return (
    <SectionWrapper id="process" className="bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-mesh rounded-full opacity-30 blur-3xl pointer-events-none" />

      <SectionHeader
        eyebrow="How it works"
        title={
          <>
            A clear path from{" "}
            <span className="gradient-text">first call to lasting change</span>
          </>
        }
        description="No guesswork. No generic plans. Just a structured, science-backed process that meets you where you are and walks with you to where you want to be."
      />

      <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 relative">
        {processSteps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="relative"
          >
            {/* Connector line */}
            {i < processSteps.length - 1 && (
              <div className="hidden lg:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/40 to-transparent" />
            )}

            <div className="relative rounded-2xl border border-border/60 bg-card p-6 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 h-full">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow">
                  <step.icon className="w-6 h-6 text-white" />
                  <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-background border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                    {step.step}
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                {step.description}
              </p>
              <span className="inline-block px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                {step.duration}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

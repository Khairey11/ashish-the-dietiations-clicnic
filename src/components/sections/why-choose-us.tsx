"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { whyChooseUs } from "@/lib/data";
import { SectionHeader, SectionWrapper } from "./section-utils";

export function WhyChooseUs() {
  return (
    <SectionWrapper id="why-choose-us" className="bg-background">
      <SectionHeader
        eyebrow="Why Choose Us"
        title={
          <>
            Science-Based Nutrition.{" "}
            <span className="gradient-text">Practical Solutions.</span>
          </>
        }
        description="We combine clinical expertise with real-world practicality to help you achieve lasting health transformations."
      />

      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {whyChooseUs.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex items-start gap-3 p-5 rounded-2xl border border-border/60 bg-card hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </SectionWrapper>
  );
}

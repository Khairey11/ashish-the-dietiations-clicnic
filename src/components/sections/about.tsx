"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Check, Target, Eye, ArrowRight, Leaf } from "lucide-react";
import { whyChooseUs } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { SectionWrapper } from "./section-utils";

export function About() {
  return (
    <SectionWrapper id="about" className="bg-muted/30">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: Why Choose Us */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Why Choose Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-balance">
            Science-Based Nutrition.{" "}
            <span className="gradient-text">Practical Solutions.</span>
          </h2>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            We combine clinical expertise with real-world practicality to help
            you achieve lasting health transformations.
          </p>

          <div className="mt-8 space-y-4">
            {whyChooseUs.map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-30px" }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right: About the clinic with decorative illustration (no photo) */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-3xl border border-border/60 bg-card p-8 shadow-premium overflow-hidden"
          >
            {/* Decorative leaf background */}
            <div className="absolute -top-12 -right-12 w-48 h-48 opacity-5">
              <svg viewBox="0 0 100 100" fill="currentColor" className="w-full h-full text-primary">
                <path d="M50 10C30 14 15 30 15 50c0 20 15 35 35 35 0-20 0-40 0-55 0-8 0-15 0-20z" />
                <path d="M50 10c20 4 35 20 35 40 0 20-15 35-35 35 0-20 0-40 0-55 0-8 0-15 0-20z" />
                <path d="M50 15v65" stroke="currentColor" strokeWidth="1" fill="none" />
                <path d="M50 30c-8 4-14 10-18 18" stroke="currentColor" strokeWidth="0.8" fill="none" />
                <path d="M50 30c8 4 14 10 18 18" stroke="currentColor" strokeWidth="0.8" fill="none" />
                <path d="M50 45c-6 2-10 6-13 12" stroke="currentColor" strokeWidth="0.8" fill="none" />
                <path d="M50 45c6 2 10 6 13 12" stroke="currentColor" strokeWidth="0.8" fill="none" />
              </svg>
            </div>

            {/* Logo + name */}
            <div className="flex items-center gap-3 mb-6 relative">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Ashish Nutrition Clinic</h3>
                <p className="text-sm text-muted-foreground">Clinical Dietitian & Nutritionist</p>
              </div>
            </div>

            {/* Bio */}
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 relative">
              We believe that nutrition care should be personal, practical, and
              sustainable. Our approach combines evidence-based clinical protocols
              with locally available foods and lifestyle-focused coaching — so you
              can build habits that last a lifetime, not just a season.
            </p>

            {/* Mission + Vision */}
            <div className="grid grid-cols-2 gap-3 mb-6 relative">
              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <Target className="w-4 h-4 text-primary" />
                </div>
                <p className="text-xs font-semibold mb-1">Our Mission</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Make evidence-based nutrition accessible and sustainable.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/10">
                <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center mb-2">
                  <Eye className="w-4 h-4 text-secondary" />
                </div>
                <p className="text-xs font-semibold mb-1">Our Vision</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  A world where chronic disease is the exception.
                </p>
              </div>
            </div>

            {/* CTA */}
            <Link href="/about">
              <Button variant="outline" className="w-full">
                Learn More About Us
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </SectionWrapper>
  );
}

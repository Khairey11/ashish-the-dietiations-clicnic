"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Target,
  Eye,
  Heart,
  Sparkles,
  Award,
  GraduationCap,
  Globe2,
  ShieldCheck,
} from "lucide-react";
import { SectionHeader, SectionWrapper } from "./section-utils";

const values = [
  {
    icon: Heart,
    title: "Empathy first",
    description:
      "We meet you where you are. No judgment, no shame — just partnership and progress.",
  },
  {
    icon: Sparkles,
    title: "Evidence over fads",
    description:
      "Every recommendation is grounded in peer-reviewed research, not Instagram trends.",
  },
  {
    icon: ShieldCheck,
    title: "Privacy by design",
    description:
      "Your health data is sacred. We are HIPAA-aligned, GDPR-compliant and ISO 27001 certified.",
  },
  {
    icon: Globe2,
    title: "Care for all",
    description:
      "Premium nutrition should not be a luxury. We offer tiered programs and scholarships.",
  },
];

const milestones = [
  { year: "2018", event: "Founded in Dharan with 1 dietitian and a big idea" },
  { year: "2020", event: "Launched online consultations during the pandemic — 5,000+ clients" },
  { year: "2022", event: "Raised Series A · Built our proprietary meal planning engine" },
  { year: "2024", event: "Crossed 12,400 transformations · Expanded to 28 clinicians" },
  { year: "2026", event: "Launched CGM integration & AI-assisted diet plans" },
];

export function About() {
  return (
    <SectionWrapper id="about" className="bg-muted/30">
      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Left: story */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Our story
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Built by clinicians,{" "}
            <span className="gradient-text">for humans</span>
          </h2>
          <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
            The Dietitian's Clinic was born in 2018 from a simple frustration: brilliant dietitians
            were stuck with paper plans and WhatsApp check-ins, while clients
            struggled to stay accountable between visits. We knew there was a
            better way.
          </p>
          <p className="mt-4 text-base text-muted-foreground leading-relaxed">
            Today, our platform powers 12,400+ transformations across South Asia —
            combining RDN-credentialed clinicians, science-backed protocols and
            elegant software that makes healthy living feel doable, even on the
            hardest days.
          </p>

          {/* Mission & Vision */}
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Our mission</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Make evidence-based nutrition care accessible, personalised and
                sustainable for every body.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-card border border-border/60">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center mb-3">
                <Eye className="w-5 h-5 text-secondary" />
              </div>
              <h3 className="text-sm font-semibold mb-1">Our vision</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A world where chronic disease is the exception, not the norm —
                starting with what&apos;s on the plate.
              </p>
            </div>
          </div>
        </div>

        {/* Right: timeline + stats */}
        <div>
          <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-premium">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Our journey
            </h3>
            <div className="relative space-y-6 before:absolute before:left-[15px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-secondary">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.year}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ring-4 ring-card">
                    <span className="text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-primary">{m.year}</p>
                    <p className="text-sm mt-0.5">{m.event}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Quick facts */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center gap-3">
              <GraduationCap className="w-8 h-8 text-primary flex-shrink-0" />
              <div>
                <p className="text-xl font-bold">28</p>
                <p className="text-[11px] text-muted-foreground">RDN-credentialed clinicians</p>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center gap-3">
              <Globe2 className="w-8 h-8 text-secondary flex-shrink-0" />
              <div>
                <p className="text-xl font-bold">12</p>
                <p className="text-[11px] text-muted-foreground">Cities served across South Asia</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="mt-20">
        <SectionHeader
          eyebrow="What we stand for"
          title="Values that shape every decision"
        />
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="p-6 rounded-2xl bg-card border border-border/60 hover:shadow-premium transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <v.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-semibold mb-2">{v.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {v.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </SectionWrapper>
  );
}

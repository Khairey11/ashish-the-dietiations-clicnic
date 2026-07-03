"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Navigation } from "@/components/site/navigation";
import { Footer } from "@/components/sections/footer";

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1 pt-20">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  accent = "from-primary/15 to-secondary/10",
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  accent?: string;
}) {
  return (
    <section className={`relative pt-12 pb-16 lg:pt-16 lg:pb-20 bg-gradient-to-br ${accent} overflow-hidden`}>
      <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
      <div className="absolute top-0 -left-20 w-72 h-72 bg-primary/15 rounded-full blur-3xl" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            {eyebrow}
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
            {title}
          </h1>
          {description && (
            <p className="mt-5 text-lg text-muted-foreground text-balance max-w-2xl">
              {description}
            </p>
          )}
        </motion.div>
      </div>
    </section>
  );
}

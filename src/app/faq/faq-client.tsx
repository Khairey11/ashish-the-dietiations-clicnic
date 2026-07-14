"use client";

import * as React from "react";
import Link from "next/link";
import { HelpCircle, MessageCircleQuestion, ChevronDown } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { type FAQ } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FAQPageClient({ faqs }: { faqs: FAQ[] }) {
  const [open, setOpen] = React.useState<number | null>(0);
  const [category, setCategory] = React.useState("All");

  const categories = ["All", ...Array.from(new Set(faqs.map((f) => f.category)))];
  const filtered = category === "All" ? faqs : faqs.filter((f) => f.category === category);

  return (
    <SiteLayout>
      <PageHero
        eyebrow="Questions & answers"
        title={<>Everything you <span className="gradient-text">might be wondering</span></>}
        description="Can't find the answer you're looking for? Our team is one message away."
        accent="from-primary/15 to-secondary/10"
      />

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all",
                  category === c
                    ? "bg-primary text-primary-foreground shadow-glow"
                    : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {filtered.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  "rounded-2xl border bg-card overflow-hidden transition-all",
                  open === i ? "border-primary/40 shadow-premium" : "border-border/60"
                )}
              >
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-start gap-4 p-5 text-left"
                  aria-expanded={open === i}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors",
                    open === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  )}>
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{faq.category}</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold pr-4">{faq.question}</p>
                  </div>
                  <ChevronDown className={cn("w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300", open === i && "rotate-180 text-primary")} />
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                >
                  <div className="px-5 pb-5 pl-[60px] text-sm text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-6 flex items-center justify-between gap-4 flex-col sm:flex-row">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
                <MessageCircleQuestion className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Still have questions?</p>
                <p className="text-sm text-muted-foreground">Our care team replies within 1 hour, Mon–Sat.</p>
              </div>
            </div>
            <Link href="/contact">
              <Button className="bg-gradient-to-r from-primary to-secondary">Talk to us</Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircleQuestion } from "lucide-react";
import { faqs as staticFaqs, type FAQ as FAQType } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

export function FAQ({ faqs = staticFaqs }: { faqs?: FAQType[] }) {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <SectionWrapper id="faq" className="bg-muted/30">
      <SectionHeader
        eyebrow="Questions & answers"
        title={
          <>
            Everything you{" "}
            <span className="gradient-text">might be wondering</span>
          </>
        }
        description="Can't find the answer you're looking for? Our team is one message away."
      />

      <div className="mt-12 max-w-3xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
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
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    {faq.category}
                  </span>
                </div>
                <p className="text-sm sm:text-base font-semibold pr-4">
                  {faq.question}
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "w-5 h-5 flex-shrink-0 text-muted-foreground transition-transform duration-300",
                  open === i && "rotate-180 text-primary"
                )}
              />
            </button>
            <motion.div
              initial={false}
              animate={{
                height: open === i ? "auto" : 0,
                opacity: open === i ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pl-[60px] text-sm text-muted-foreground leading-relaxed">
                {faq.answer}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Contact prompt */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mt-10 max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-6 flex items-center justify-between gap-4 flex-col sm:flex-row"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <MessageCircleQuestion className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">Still have questions?</p>
            <p className="text-sm text-muted-foreground">Our care team replies within 1 hour, Mon–Sat.</p>
          </div>
        </div>
        <Button
          onClick={() => document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" })}
          className="bg-gradient-to-r from-primary to-secondary"
        >
          Talk to us
        </Button>
      </motion.div>
    </SectionWrapper>
  );
}

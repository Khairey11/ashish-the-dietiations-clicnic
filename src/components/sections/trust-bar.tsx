"use client";

import { motion } from "framer-motion";
import { GraduationCap, ClipboardCheck, Apple, BookOpen, MonitorSmartphone } from "lucide-react";

const credentials = [
  { icon: GraduationCap, label: "Bachelor of Nutrition & Dietetics" },
  { icon: ClipboardCheck, label: "Critical Decision & Assessments" },
  { icon: Apple, label: "Nutrition Counseling" },
  { icon: BookOpen, label: "Evidence-Based Practices" },
  { icon: MonitorSmartphone, label: "Online & In-person Consultations" },
];

export function TrustBar() {
  return (
    <section className="py-8 lg:py-10 border-y border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {credentials.map((cred, i) => (
            <motion.div
              key={cred.label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col items-center text-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <cred.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="text-xs font-medium text-muted-foreground leading-snug max-w-[120px]">
                {cred.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

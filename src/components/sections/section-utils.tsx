"use client";

import * as React from "react";
import { motion, useInView } from "framer-motion";

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5 }}
      className={
        align === "center"
          ? `max-w-3xl mx-auto text-center ${className || ""}`
          : `max-w-3xl ${className || ""}`
      }
    >
      {eyebrow && (
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
        {title}
      </h2>
      {description && (
        <p
          className={
            align === "center"
              ? "mt-4 text-lg text-muted-foreground text-balance"
              : "mt-4 text-lg text-muted-foreground text-balance"
          }
        >
          {description}
        </p>
      )}
    </motion.div>
  );
}

export function SectionWrapper({
  id,
  children,
  className,
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`py-20 lg:py-28 ${className || ""}`}>
      <div className="container mx-auto px-4 sm:px-6">{children}</div>
    </section>
  );
}

export function AnimatedNumber({
  value,
  suffix,
  duration = 2,
}: {
  value: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [display, setDisplay] = React.useState("0");

  React.useEffect(() => {
    if (!inView) return;
    // Parse numeric component
    const num = parseFloat(value.replace(/[^0-9.]/g, ""));
    const prefix = value.replace(/[0-9.,]/g, "");
    if (isNaN(num)) {
      setDisplay(value);
      return;
    }
    let start: number | null = null;
    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = num * eased;
      setDisplay(
        num >= 100
          ? `${Math.round(current).toLocaleString()}`
          : num >= 10
          ? `${current.toFixed(1)}`
          : `${current.toFixed(1)}`
      );
      if (progress < 1) requestAnimationFrame(step);
      else setDisplay(prefix ? `${prefix}${num.toLocaleString()}` : num.toLocaleString());
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);

  return (
    <span ref={ref}>
      {display}
      {suffix && <span>{suffix}</span>}
    </span>
  );
}

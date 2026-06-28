"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Leaf,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Linkedin,
  ArrowRight,
  Send,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const footerNav = [
  {
    title: "Services",
    links: [
      "Weight Loss",
      "Weight Gain",
      "PCOS Diet",
      "Diabetes Diet",
      "Thyroid Diet",
      "Pregnancy Nutrition",
      "Sports Nutrition",
      "Corporate Wellness",
    ],
  },
  {
    title: "Programs",
    links: [
      "30-Day Starter",
      "60-Day Transform",
      "90-Day Lifestyle",
      "180-Day Deep",
      "365-Day Annual",
      "Body Composition Analysis",
      "Compare Programs",
    ],
  },
  {
    title: "Company",
    links: [
      "About Us",
      "Meet the Team",
      "Our Process",
      "Blog",
      "Careers",
      "Press",
      "Contact",
    ],
  },
  {
    title: "Resources",
    links: [
      "BMI Calculator",
      "Recipe Library",
      "FAQs",
      "Client Dashboard",
      "Admin Portal",
      "Privacy Policy",
      "Terms of Service",
    ],
  },
];

const socials = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  const [email, setEmail] = React.useState("");

  const subscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    toast.success("Subscribed!", {
      description: "Welcome to the Nutria+ weekly newsletter.",
    });
    setEmail("");
  };

  return (
    <footer className="mt-auto bg-foreground text-background">
      {/* Final CTA */}
      <div className="container mx-auto px-4 sm:px-6 pt-16 lg:pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl bg-gradient-to-br from-primary to-secondary p-8 sm:p-12 lg:p-16 overflow-hidden"
        >
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-accent/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

          <div className="relative grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-white text-xs font-semibold mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Start this week
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight text-balance">
                Your healthiest year
                <br /> starts today.
              </h2>
              <p className="mt-4 text-white/85 text-lg max-w-md">
                Book a free 15-minute discovery call. No pressure, no commitment —
                just a conversation about how we can help.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
              <Button
                size="lg"
                onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-white text-primary hover:bg-white/90 h-12 px-6 text-base"
              >
                Book free call
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.querySelector("#programs")?.scrollIntoView({ behavior: "smooth" })}
                className="border-white/40 text-white hover:bg-white/10 hover:text-white h-12 px-6 text-base"
              >
                Explore programs
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 sm:px-6 pt-16 lg:pt-20 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand + newsletter */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-lg font-bold tracking-tight">
                  Nutria<span className="text-primary">+</span>
                </span>
                <span className="text-[10px] text-background/60 font-medium tracking-wide">
                  PREMIUM NUTRITION
                </span>
              </div>
            </div>
            <p className="text-sm text-background/70 leading-relaxed mb-5 max-w-sm">
              Premium dietitian & nutrition consultancy. Personalized plans,
              certified clinicians, science-backed results.
            </p>

            {/* Newsletter */}
            <form onSubmit={subscribe} className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-background/80 mb-2">
                Weekly nutrition insights
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/50 h-10"
                />
                <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 h-10 px-3">
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>

            {/* Contact */}
            <div className="space-y-1.5 text-xs text-background/70">
              <a href="tel:+97714445566" className="flex items-center gap-2 hover:text-background transition-colors">
                <Phone className="w-3.5 h-3.5" />
                +977-1-4445566
              </a>
              <a href="mailto:care@nutriaplus.health" className="flex items-center gap-2 hover:text-background transition-colors">
                <Mail className="w-3.5 h-3.5" />
                care@nutriaplus.health
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Banasthali, Baluwatar-4, Kathmandu 44600, Nepal
              </p>
            </div>
          </div>

          {/* Nav columns */}
          {footerNav.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-xs text-background/70 hover:text-background transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <p className="text-xs text-background/60">
              © 2026 Nutria+ Health Pvt. Ltd. All rights reserved.
            </p>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md bg-background/10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] text-background/70 font-medium">
                HIPAA-aligned · ISO 27001
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 rounded-lg bg-background/10 hover:bg-primary flex items-center justify-center transition-colors"
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

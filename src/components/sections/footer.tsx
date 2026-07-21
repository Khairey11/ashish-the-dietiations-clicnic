"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
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
import { subscribeNewsletter } from "@/lib/actions/contact";
import { siteConfig, whatsappLink, phoneLink, defaultWhatsappMessage, type DynamicConfig } from "@/lib/site-config";

const footerNav = [
  {
    title: "Services",
    links: [
      { label: "Weight Loss", href: "/services/weight-loss" },
      { label: "Weight Gain", href: "/services/weight-gain" },
      { label: "PMOS Diet", href: "/services/pcos-diet" },
      { label: "Diabetes Diet", href: "/services/diabetes-diet" },
      { label: "Thyroid Diet", href: "/services/thyroid-diet" },
      { label: "Pregnancy Nutrition", href: "/services/pregnancy-nutrition" },
      { label: "Child Nutrition", href: "/services/child-nutrition" },
      { label: "School Nutrition", href: "/services/school-nutrition" },
      { label: "Sports Nutrition", href: "/services/sports-nutrition" },
      { label: "Healthy Aging", href: "/services/healthy-aging" },
      { label: "Corporate Wellness", href: "/services/corporate-wellness" },
      { label: "Public Health", href: "/services/public-health-nutrition" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "All Programs", href: "/programs" },
      { label: "Compare Programs", href: "/programs" },
      { label: "Body Composition Analysis", href: "/services/body-composition" },
      { label: "Book Consultation", href: "/booking" },
      { label: "BMI Calculator", href: "/#bmi-calculator" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Meet the Team", href: "/dietitians" },
      { label: "Blog", href: "/blog" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Contact", href: "/contact" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Client Login", href: "/login" },
      { label: "Client Dashboard", href: "/dashboard" },
      { label: "Admin Portal", href: "/admin" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
];

const socials = [
  { icon: Instagram, href: siteConfig.social.instagram || siteConfig.social.instagram, label: "Instagram" },
  { icon: Facebook, href: siteConfig.social.facebook || siteConfig.social.facebook, label: "Facebook" },
  { icon: Twitter, href: siteConfig.social.twitter || siteConfig.social.twitter, label: "Twitter" },
  { icon: Youtube, href: siteConfig.social.youtube || siteConfig.social.youtube, label: "YouTube" },
  { icon: Linkedin, href: siteConfig.social.linkedin || siteConfig.social.linkedin, label: "LinkedIn" },
];

export function Footer({ config }: { config?: DynamicConfig }) {
  const phoneDisplay = config?.phoneDisplay || siteConfig.phoneDisplay;
  const whatsappDisplay = config?.whatsappDisplay || siteConfig.whatsappDisplay;
  const clinicEmail = config?.email || siteConfig.email;
  const address = config?.address || siteConfig.address;
  const whatsappRaw = config?.whatsappRaw || siteConfig.whatsappRaw;
  const [newsletterEmail, setNewsletterEmail] = React.useState("");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      const result = await subscribeNewsletter({ email: newsletterEmail });
      if (result.success) {
        toast.success("Subscribed!", {
          description: result.message,
        });
        setNewsletterEmail("");
      } else {
        toast.error("Subscription failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch {
      toast.error("Subscription failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    }
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
              <Link href="/booking" className="inline-block">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-white/90 h-12 px-6 text-base w-full sm:w-auto"
                >
                  Book free call
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/programs" className="inline-block">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/60 text-white hover:bg-white hover:text-primary hover:border-white h-12 px-6 text-base w-full sm:w-auto font-semibold"
                >
                  Explore programs
                </Button>
              </Link>
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
              <Image
                src="/logo-transparent.png"
                alt="Ashish Nutrition Clinic logo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
              />
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight">
                  The Dietitian&apos;s Clinic
                </span>
                <span className="text-[10px] text-background/60 font-medium tracking-wide">
                  CENTER FOR CLINICAL & PERFORMANCE NUTRITION
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
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
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
              <a href={phoneLink()} className="flex items-center gap-2 hover:text-background transition-colors">
                <Phone className="w-3.5 h-3.5" />
                {phoneDisplay}
              </a>
              <a
                href={whatsappLink(defaultWhatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-background transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                WhatsApp: {whatsappDisplay}
              </a>
              <a href={`mailto:${clinicEmail}`} className="flex items-center gap-2 hover:text-background transition-colors">
                <Mail className="w-3.5 h-3.5" />
                {clinicEmail}
              </a>
              <p className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                {address}
              </p>
            </div>
          </div>

          {/* Nav columns */}
          {footerNav.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs text-background/70 hover:text-background transition-colors"
                    >
                      {link.label}
                    </Link>
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
              © 2026 The Dietitian&apos;s Clinic Pvt. Ltd. All rights reserved.
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

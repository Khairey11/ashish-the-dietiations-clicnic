"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mail, Phone, MapPin, MessageCircle,
  Facebook, Instagram, Linkedin, Youtube,
  Send,
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
      { label: "Weight Management", href: "/services/weight-loss" },
      { label: "Clinical Nutrition", href: "/services/diabetes-diet" },
      { label: "Women's Health", href: "/services/pcos-diet" },
      { label: "Child Nutrition", href: "/services/child-nutrition" },
      { label: "Sports Nutrition", href: "/services/sports-nutrition" },
      { label: "View All Services", href: "/services" },
    ],
  },
  {
    title: "Programs",
    links: [
      { label: "All Programs", href: "/programs" },
      { label: "Book Consultation", href: "/booking" },
      { label: "BMI Calculator", href: "/#bmi-calculator" },
      { label: "Body Composition", href: "/services/body-composition" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Blog", href: "/blog" },
      { label: "FAQs", href: "/faq" },
      { label: "Testimonials", href: "/testimonials" },
      { label: "Privacy Policy", href: "/privacy" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Meet the Team", href: "/dietitians" },
      { label: "Contact", href: "/contact" },
      { label: "Client Login", href: "/login" },
    ],
  },
];

const socials = [
  { icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
  { icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
  { icon: Linkedin, href: siteConfig.social.linkedin, label: "LinkedIn" },
  { icon: Youtube, href: siteConfig.social.youtube, label: "YouTube" },
];

export function Footer({ config }: { config?: DynamicConfig }) {
  const phoneDisplay = config?.phoneDisplay || siteConfig.phoneDisplay;
  const whatsappDisplay = config?.whatsappDisplay || siteConfig.whatsappDisplay;
  const clinicEmail = config?.email || siteConfig.email;
  const address = config?.address || siteConfig.address;
  const [newsletterEmail, setNewsletterEmail] = React.useState("");

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      const result = await subscribeNewsletter({ email: newsletterEmail });
      if (result.success) {
        toast.success("Subscribed!", { description: result.message });
        setNewsletterEmail("");
      } else {
        toast.error("Subscription failed", { description: result.error || "Please try again." });
      }
    } catch {
      toast.error("Subscription failed", { description: "An unexpected error occurred." });
    }
  };

  return (
    <footer className="mt-auto bg-[oklch(0.2_0.03_145)] text-white">
      {/* Contact bar */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 sm:px-6 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <a href={phoneLink()} className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Phone</p>
                <p className="font-medium truncate">{phoneDisplay}</p>
              </div>
            </a>
            <a href={whatsappLink(defaultWhatsappMessage)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/50 uppercase tracking-wider">WhatsApp</p>
                <p className="font-medium truncate">{whatsappDisplay}</p>
              </div>
            </a>
            <a href={`mailto:${clinicEmail}`} className="flex items-center gap-2.5 text-sm hover:text-primary transition-colors">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Email</p>
                <p className="font-medium truncate">{clinicEmail}</p>
              </div>
            </a>
            <div className="flex items-center gap-2.5 text-sm">
              <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Location</p>
                <p className="font-medium truncate">{address}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="container mx-auto px-4 sm:px-6 pt-12 lg:pt-16 pb-8">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image src="/logo.svg" alt="Ashish Nutrition Clinic logo" width={36} height={36} className="w-9 h-9" />
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight">Ashish</span>
                <span className="text-[10px] text-white/60 font-medium tracking-wide">NUTRITION CLINIC</span>
              </div>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-5 max-w-sm">
              Nourishing health, transforming lives. Personalized nutrition care designed around you — backed by science, built around your life.
            </p>
            <div className="flex items-center gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-primary flex items-center justify-center transition-colors"
                >
                  <s.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Nav columns */}
          {footerNav.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold mb-4">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-xs text-white/70 hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Newsletter */}
          <form onSubmit={subscribe} className="flex items-center gap-2 w-full lg:w-auto">
            <p className="text-xs font-medium text-white/80 whitespace-nowrap hidden sm:block">Subscribe for Nutrition Tips</p>
            <Input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@email.com"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/40 h-9 max-w-[200px]"
            />
            <Button type="submit" size="sm" className="bg-primary hover:bg-primary/90 h-9 px-3">
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>

          <div className="flex items-center gap-4 text-xs text-white/50">
            <p>&copy; 2026 Ashish Nutrition Clinic. All rights reserved.</p>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

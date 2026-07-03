"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageCircle,
  Send,
  Navigation,
  Calendar,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { toast } from "sonner";
import { submitContactForm } from "@/lib/actions/contact";
import { siteConfig, whatsappLink, phoneLink, defaultWhatsappMessage } from "@/lib/site-config";

const hours = [
  { day: "Sunday – Friday", time: siteConfig.weekdayHours },
  { day: "Saturday", time: siteConfig.saturdayHours },
  { day: "Public Holidays", time: "By appointment" },
];

const contactMethods = [
  {
    icon: Phone,
    label: "Call us",
    value: siteConfig.phoneDisplay,
    subtext: "Mon–Sat, 7AM–8PM",
    href: phoneLink(),
    external: false,
    accent: "from-emerald-500 to-teal-500",
  },
  {
    icon: MessageCircle,
    label: "WhatsApp",
    value: siteConfig.whatsappDisplay,
    subtext: "Fastest response",
    href: whatsappLink(defaultWhatsappMessage),
    external: true,
    accent: "from-[#25D366] to-emerald-500",
  },
  {
    icon: Mail,
    label: "Email",
    value: siteConfig.email,
    subtext: "Reply within 1 hour",
    href: `mailto:${siteConfig.email}`,
    external: false,
    accent: "from-sky-500 to-blue-500",
  },
];

export function Contact() {
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [submitting, setSubmitting] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await submitContactForm(form);
      if (result.success) {
        toast.success("Message sent!", {
          description: result.message || "We'll be in touch within 1 hour.",
        });
        setForm({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error("Submission failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch (e) {
      toast.error("Submission failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SectionWrapper id="contact" className="bg-background">
      <SectionHeader
        eyebrow="Get in touch"
        title={
          <>
            We&apos;re here when you{" "}
            <span className="gradient-text">need us</span>
          </>
        }
        description="Whether you have a quick question or are ready to start your journey, our team is ready to help."
      />

      <div className="mt-12 grid lg:grid-cols-2 gap-6">
        {/* Left: contact info + map */}
        <div className="space-y-4">
          {/* Contact methods */}
          <div className="grid sm:grid-cols-3 gap-3">
            {contactMethods.map((m, i) => (
              <motion.a
                key={m.label}
                href={m.href}
                target={m.external ? "_blank" : undefined}
                rel={m.external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group p-4 rounded-2xl border border-border/60 bg-card hover:shadow-premium hover:-translate-y-1 transition-all"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${m.accent} flex items-center justify-center mb-3`}>
                  <m.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-muted-foreground">{m.label}</p>
                <p className="text-sm font-semibold mt-0.5">{m.value}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{m.subtext}</p>
              </motion.a>
            ))}
          </div>

          {/* Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl overflow-hidden border border-border/60 bg-card h-64"
          >
            {/* Stylized map */}
            <div className="absolute inset-0 bg-mesh">
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                <defs>
                  <pattern id="mapGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="oklch(0.62 0.18 145 / 0.1)" strokeWidth="1" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapGrid)" />
                {/* Roads */}
                <path d="M0,80 Q200,60 400,100 T800,80" fill="none" stroke="oklch(0.62 0.18 145 / 0.3)" strokeWidth="3" />
                <path d="M100,0 Q150,150 200,300" fill="none" stroke="oklch(0.65 0.16 230 / 0.3)" strokeWidth="2" />
                <path d="M0,200 L800,180" fill="none" stroke="oklch(0.62 0.18 145 / 0.25)" strokeWidth="4" />
              </svg>
              {/* Pin */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/40 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow pulse-ring">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              {/* Address card */}
              <div className="absolute bottom-4 left-4 right-4 glass rounded-xl p-3 shadow-premium">
                <div className="flex items-start gap-2">
                  <Navigation className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold">{siteConfig.name}</p>
                    <p className="text-xs text-muted-foreground">{siteConfig.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-border/60 bg-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-primary" />
              <h3 className="text-sm font-semibold uppercase tracking-wider">Clinic hours</h3>
            </div>
            <div className="space-y-2">
              {hours.map((h) => (
                <div key={h.day} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{h.day}</span>
                  <span className="font-semibold">{h.time}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right: form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-premium"
        >
          <h3 className="text-xl font-semibold mb-1">Send us a message</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Fill in the form and our team will respond within 1 hour during clinic hours.
          </p>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-name" className="text-xs">Full name *</Label>
                <Input
                  id="c-name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="c-phone" className="text-xs">Phone *</Label>
                <Input
                  id="c-phone"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+977 98XXXXXXXX"
                  className="h-11"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-email" className="text-xs">Email *</Label>
              <Input
                id="c-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@email.com"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="c-message" className="text-xs">How can we help? *</Label>
              <Textarea
                id="c-message"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us about your goals, questions, or preferred consultation time..."
                className="resize-none"
                rows={5}
              />
            </div>
            <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/50">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                Prefer to book directly? Use the{" "}
                <button
                  type="button"
                  onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
                  className="text-primary font-semibold hover:underline"
                >
                  booking wizard
                </button>{" "}
                — it takes less than 2 minutes.
              </p>
            </div>
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-11 bg-gradient-to-r from-primary to-secondary"
            >
              {submitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  Send message
                  <Send className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

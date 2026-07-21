"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig, whatsappLink } from "@/lib/site-config";

export function CTABanner() {
  return (
    <section className="relative py-16 lg:py-20 bg-gradient-to-br from-primary to-secondary overflow-hidden">
      {/* Decorative pattern */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto text-center text-white"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/15 backdrop-blur mb-6">
            <Calendar className="w-7 h-7" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            Ready to Start Your Health Journey?
          </h2>
          <p className="text-white/85 text-lg leading-relaxed mb-8 max-w-xl mx-auto">
            Get personalized nutrition guidance from a clinical dietitian. Book your consultation today — online or in-person.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/booking">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 h-12 px-8 text-base font-semibold">
                Book Consultation
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <span className="text-white/60 text-sm font-medium">or</span>
            <a
              href={whatsappLink(`Hi Ashish, I'd like to book a nutrition consultation.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-12 px-6 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors text-base font-semibold gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

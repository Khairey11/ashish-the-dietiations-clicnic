"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, Search, Leaf, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navigation } from "@/components/site/navigation";

const popularPages = [
  { label: "Home", href: "/", description: "Start here" },
  { label: "Services", href: "/services", description: "12 specialised programs" },
  { label: "Programs", href: "/programs", description: "Pricing & comparison" },
  { label: "Book Consultation", href: "/booking", description: "Reserve your slot" },
  { label: "Blog", href: "/blog", description: "Insights & research" },
  { label: "Contact", href: "/contact", description: "Get in touch" },
];

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main className="flex-1 pt-20 flex items-center justify-center px-4 sm:px-6 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-20 left-1/3 w-72 h-72 bg-primary/15 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-1/3 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-2xl w-full text-center py-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-secondary mb-8 shadow-glow"
          >
            <Leaf className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-7xl sm:text-9xl font-bold tracking-tight gradient-text"
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight"
          >
            This page is off your plate
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-3 text-muted-foreground text-lg max-w-md mx-auto"
          >
            The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link href="/">
              <Button size="lg" className="bg-gradient-to-r from-primary to-secondary h-12 px-6">
                <Home className="w-4 h-4 mr-2" />
                Back to home
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="h-12 px-6">
                <MessageCircle className="w-4 h-4 mr-2" />
                Contact support
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center justify-center gap-1.5">
              <Search className="w-3 h-3" />
              Popular pages
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {popularPages.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="group p-4 rounded-2xl border border-border/60 bg-card hover:shadow-premium hover:-translate-y-0.5 transition-all"
                >
                  <p className="text-sm font-semibold group-hover:text-primary transition-colors">{p.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.description}</p>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

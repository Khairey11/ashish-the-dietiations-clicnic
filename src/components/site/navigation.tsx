"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Command, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Services", href: "/services" },
  { label: "Programs", href: "/programs" },
  { label: "Dietitians", href: "/dietitians" },
  { label: "Results", href: "/testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export function Navigation() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [cmdOpen, setCmdOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setCmdOpen(false);
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    setCmdOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const go = (href: string) => {
    setMobileOpen(false);
    setCmdOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled ? "py-2.5" : "py-4"
        )}
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between gap-4 rounded-2xl px-4 sm:px-6 transition-all duration-300",
              scrolled ? "glass shadow-premium h-14" : "h-16 bg-transparent"
            )}
          >
            <Link
              href="/"
              onClick={() => go("/")}
              className="flex items-center gap-2.5 group"
              aria-label="The Dietitian's Clinic home"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <img
                  src="/icon.svg"
                  alt=""
                  className="relative w-9 h-9 rounded-xl shadow-glow"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight">
                  The Dietitian&apos;s Clinic
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                  PREMIUM NUTRITION CONSULTANCY
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => go(link.href)}
                  className="px-3.5 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/60 rounded-lg transition-all"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCmdOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground border border-border/60 rounded-lg hover:bg-muted/60 transition-colors"
                aria-label="Open command palette"
              >
                <Command className="w-3 h-3" />
                <span>Search</span>
                <kbd className="ml-2 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
                  ⌘K
                </kbd>
              </button>

              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              )}

              <Link href="/booking">
                <Button
                  size="sm"
                  className="hidden sm:inline-flex shimmer-btn bg-gradient-to-r from-primary to-secondary hover:shadow-glow"
                >
                  Book Consultation
                </Button>
              </Link>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] glass border-l border-border/40 p-6 pt-24 flex flex-col gap-2"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => go(link.href)}
                  className="flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl hover:bg-muted/80 transition-colors text-left"
                >
                  {link.label}
                  <ChevronDown className="w-4 h-4 -rotate-90 text-muted-foreground" />
                </Link>
              ))}
              <Link href="/booking">
                <Button
                  className="mt-4 bg-gradient-to-r from-primary to-secondary w-full"
                >
                  Book Consultation
                </Button>
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cmdOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-[10vh] px-4"
          >
            <div
              className="absolute inset-0 bg-background/60 backdrop-blur-sm"
              onClick={() => setCmdOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl glass rounded-2xl shadow-premium overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
                <Command className="w-4 h-4 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="Search services, programs, dietitians, blogs..."
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-muted-foreground"
                />
                <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
                  ESC
                </kbd>
              </div>
              <div className="max-h-80 overflow-y-auto p-2">
                <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Quick navigation
                </p>
                {[
                  ...navLinks,
                  { label: "Book Consultation", href: "/booking" },
                  { label: "Contact", href: "/contact" },
                  { label: "FAQ", href: "/faq" },
                  { label: "Client Login", href: "/login" },
                  { label: "Admin Portal", href: "/admin" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => go(item.href)}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-muted/80 transition-colors text-sm text-left"
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="w-4 h-4 -rotate-90 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

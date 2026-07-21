"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Programs", href: "/programs" },
  { label: "Pricing", href: "/pricing" },
  { label: "Dietitians", href: "/dietitians" },
  { label: "Success Stories", href: "/testimonials" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export function Navigation() {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const pathname = usePathname();

  React.useEffect(() => setMounted(true), []);

  // Check if user is logged in (hide login CTA if so)
  React.useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => {
        if (r.ok) setIsLoggedIn(true);
        else setIsLoggedIn(false);
      })
      .catch(() => setIsLoggedIn(false));
  }, [pathname]);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const go = (href: string) => {
    setMobileOpen(false);
    void href;
  };

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

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
              aria-label="Ashish Nutrition Clinic home"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src="/logo.svg"
                  alt="Ashish Nutrition Clinic logo"
                  width={36}
                  height={36}
                  className="relative w-9 h-9"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className="text-base font-bold tracking-tight">
                  Ashish
                </span>
                <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
                  NUTRITION CLINIC
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => go(link.href)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "px-3.5 py-2 text-sm font-medium rounded-lg transition-all",
                    isActive(link.href)
                      ? "text-foreground bg-muted/80"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors"
                  aria-label="Toggle theme"
                  aria-pressed={theme === "dark"}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4" />
                  ) : (
                    <Moon className="w-4 h-4" />
                  )}
                </button>
              )}

              {!isLoggedIn && (
                <Link href="/login" className="hidden sm:inline-flex">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-sm font-medium"
                  >
                    Client Login
                  </Button>
                </Link>
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
                className="lg:hidden w-11 h-11 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors"
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu-panel"
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
              id="mobile-menu-panel"
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
              {!isLoggedIn && (
                <Link href="/login" className="block mt-4">
                  <Button variant="outline" className="w-full">
                    Client Login
                  </Button>
                </Link>
              )}
              <Link href="/booking">
                <Button
                  className="mt-2 bg-gradient-to-r from-primary to-secondary w-full"
                >
                  Book Consultation
                </Button>
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}

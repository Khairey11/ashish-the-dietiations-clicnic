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

  // Lock body scroll when mobile menu is open
  React.useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
          scrolled ? "py-2 sm:py-2.5" : "py-3 sm:py-4"
        )}
      >
        <div className="container mx-auto px-3 sm:px-6">
          <div
            className={cn(
              "flex items-center justify-between gap-2 sm:gap-4 rounded-2xl px-3 sm:px-6 transition-all duration-300",
              scrolled
                ? "bg-background shadow-premium h-14 border border-border/40"
                : "h-16 bg-transparent"
            )}
          >
            {/* Brand */}
            <Link
              href="/"
              onClick={() => go("/")}
              className="flex items-center gap-2 sm:gap-2.5 group flex-shrink-0 min-w-0"
              aria-label="The Dietitian's Clinic home"
            >
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-primary/40 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <Image
                  src="/logo-transparent.png"
                  alt="The Dietitian's Clinic for Clinical & Performance Nutrition logo"
                  width={36}
                  height={36}
                  className="relative w-8 h-8 sm:w-9 sm:h-9 object-contain"
                  priority
                />
              </div>
              <div className="flex flex-col leading-none min-w-0">
                <span className="text-sm sm:text-base font-bold tracking-tight truncate">
                  The Dietitian's Clinic
                </span>
                <span className="text-[8px] sm:text-[10px] text-muted-foreground font-medium tracking-wide truncate">
                  Centre for Clinical & Performance Nutrition
                </span>
              </div>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => go(link.href)}
                  aria-current={isActive(link.href) ? "page" : undefined}
                  className={cn(
                    "px-3.5 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap",
                    isActive(link.href)
                      ? "text-foreground bg-muted/80"
                      : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors"
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
                <Link href="/login" className="hidden md:inline-flex">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-sm font-medium"
                  >
                    Client Login
                  </Button>
                </Link>
              )}

              <Link href="/booking" className="hidden sm:inline-flex">
                <Button
                  size="sm"
                  className="shimmer-btn bg-secondary hover:bg-secondary/90 hover:shadow-glow whitespace-nowrap"
                >
                  Book Consultation
                </Button>
              </Link>

              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="lg:hidden w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-lg hover:bg-muted/60 transition-colors flex-shrink-0"
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
              className="absolute right-0 top-0 bottom-0 w-[280px] max-w-[85vw] glass border-l border-border/40 p-5 pt-20 sm:pt-24 flex flex-col gap-1 overflow-y-auto"
            >
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => go(link.href)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 text-base font-medium rounded-xl hover:bg-muted/80 transition-colors text-left",
                    isActive(link.href) && "bg-muted/80"
                  )}
                >
                  {link.label}
                  <ChevronDown className="w-4 h-4 -rotate-90 text-muted-foreground" />
                </Link>
              ))}
              <div className="mt-4 flex flex-col gap-2">
                {!isLoggedIn && (
                  <Link href="/login">
                    <Button variant="outline" className="w-full">
                      Client Login
                    </Button>
                  </Link>
                )}
                <Link href="/booking">
                  <Button className="bg-secondary hover:bg-secondary/90 w-full">
                    Book Consultation
                  </Button>
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  );
}
"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, CalendarDays, CreditCard, Star, Bell,
  ShieldCheck, Settings, Menu, ChevronLeft, FileText, MessageCircle, Utensils, UserCog,
} from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const sidebarItems: Array<{
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
}> = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin" },
  { icon: Users, label: "Clients", href: "/admin/clients" },
  { icon: UserCog, label: "Dietitians", href: "/admin/dietitians" },
  { icon: CalendarDays, label: "Appointments", href: "/admin/appointments" },
  { icon: Utensils, label: "Meal Plans", href: "/admin/meal-plans" },
  { icon: MessageCircle, label: "Messages", href: "/admin/messages" },
  { icon: CreditCard, label: "Payments", href: "/admin/payments" },
  { icon: FileText, label: "Services", href: "/admin/services" },
  { icon: CreditCard, label: "Programs", href: "/admin/programs" },
  { icon: Star, label: "Testimonials", href: "/admin/testimonials" },
  { icon: FileText, label: "Blog CMS", href: "/admin/blog" },
  { icon: Bell, label: "FAQs", href: "/admin/faqs" },
  { icon: Bell, label: "Newsletter", href: "/admin/newsletter" },
  { icon: ShieldCheck, label: "Audit Log", href: "/admin/audit-log" },
  { icon: Settings, label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    // Fetch unread message count
    fetch("/api/messages")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (d?.success) {
          const unread = d.data.filter((m: any) => !m.isRead && m.recipient.role !== "CLIENT").length;
          setUnreadCount(unread);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      <main id="main" className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Mobile sidebar toggle */}
          <div className="lg:hidden mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-4 h-4 mr-2" />
              Admin menu
            </Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:col-span-2 flex-col gap-1 p-4 rounded-2xl border border-border/60 bg-card h-fit sticky top-24">
              <div className="flex items-center gap-2 px-2 py-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold">Admin Portal</p>
                  <p className="text-[10px] text-muted-foreground">Clinic management</p>
                </div>
              </div>
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-3.5 h-3.5" />
                  <span className="flex-1">{item.label}</span>
                  {item.label === "Messages" && unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[9px] font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-border/40">
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  Back to site
                </Link>
              </div>
            </aside>

            {/* Main content */}
            <div className="lg:col-span-10">{children}</div>
          </div>
        </div>
      </main>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute left-0 top-0 bottom-0 w-[260px] glass border-r border-border/40 p-6 pt-20 flex flex-col gap-1"
            >
              {sidebarItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-border/40">
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back to site
                </Link>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

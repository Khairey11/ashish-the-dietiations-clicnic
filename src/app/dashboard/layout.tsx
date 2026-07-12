"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import {
  Home, Calendar, FileText, MessageCircle, Bell, Settings, LogOut, Menu, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: MessageCircle, label: "Messages", href: "/dashboard/messages" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [userName, setUserName] = React.useState("");

  React.useEffect(() => {
    fetch("/api/client/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d?.success) setUserName(d.data?.user?.name || "Client");
      })
      .catch(() => {});
  }, []);

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const signOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    toast.success("Signed out");
    router.push("/");
    router.refresh();
  };

  const initials = (userName || "?").split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <main id="main" className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Mobile toggle */}
          <div className="lg:hidden mb-4">
            <Button variant="outline" size="sm" onClick={() => setMobileOpen(true)}>
              <Menu className="w-4 h-4 mr-2" />
              Dashboard menu
            </Button>
          </div>

          <div className="grid lg:grid-cols-12 gap-6">
            {/* Desktop sidebar */}
            <aside className="hidden lg:flex lg:col-span-2 flex-col gap-1 p-4 rounded-2xl border border-border/60 bg-card h-fit sticky top-24">
              <div className="flex items-center gap-2 px-2 py-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold truncate">{userName}</p>
                  <p className="text-[10px] text-muted-foreground">Client</p>
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
                </Link>
              ))}
              <div className="mt-2 pt-2 border-t border-border/40">
                <button
                  onClick={signOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign out
                </button>
              </div>
            </aside>

            {/* Main content */}
            <div className="lg:col-span-10">{children}</div>
          </div>
        </div>
      </main>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
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
                <button
                  onClick={() => { setMobileOpen(false); signOut(); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Phone, Mail, Calendar } from "lucide-react";
import { siteConfig, whatsappLink, phoneLink, defaultWhatsappMessage } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Floating WhatsApp + quick-contact button.
 * Appears on every page (mounted in root layout).
 * - Pinned to bottom-right on desktop, bottom-right on mobile.
 * - Click to expand: WhatsApp / Call / Email / Book.
 */
export function FloatingWhatsApp() {
  const [open, setOpen] = React.useState(false);
  const [showLabel, setShowLabel] = React.useState(false);

  // After 4 seconds, briefly show the "Chat with us" label pulse to draw attention
  React.useEffect(() => {
    const t = setTimeout(() => {
      setShowLabel(true);
      setTimeout(() => setShowLabel(false), 4000);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  const actions = [
    {
      label: "WhatsApp",
      sublabel: "Fastest reply",
      icon: MessageCircle,
      href: whatsappLink(defaultWhatsappMessage),
      accent: "bg-[#25D366] text-white",
      external: true,
    },
    {
      label: "Call us",
      sublabel: siteConfig.phoneDisplay,
      icon: Phone,
      href: phoneLink(),
      accent: "bg-primary text-primary-foreground",
      external: false,
    },
    {
      label: "Email",
      sublabel: "Within 1 hour",
      icon: Mail,
      href: `mailto:${siteConfig.email}`,
      accent: "bg-accent text-accent-foreground",
      external: false,
    },
    {
      label: "Book now",
      sublabel: "2-min wizard",
      icon: Calendar,
      href: "/booking",
      accent: "bg-gradient-to-r from-primary to-secondary text-white",
      external: false,
    },
  ];

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 print:hidden">
      {/* Expanded action chips */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2 items-end"
          >
            {actions.map((a, i) => (
              <motion.a
                key={a.label}
                href={a.href}
                target={a.external ? "_blank" : undefined}
                rel={a.external ? "noopener noreferrer" : undefined}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: i * 0.05 }}
                className="group flex items-center gap-3"
              >
                <div className="flex flex-col items-end px-3 py-1.5 rounded-xl glass shadow-premium max-w-[200px]">
                  <span className="text-xs font-semibold leading-tight">{a.label}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{a.sublabel}</span>
                </div>
                <div className={cn("w-11 h-11 rounded-full flex items-center justify-center shadow-premium transition-transform group-hover:scale-110", a.accent)}>
                  <a.icon className="w-5 h-5" />
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main button with attention-pulse label */}
      <div className="flex items-center gap-2">
        <AnimatePresence>
          {showLabel && !open && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.9 }}
              className="px-3 py-2 rounded-xl glass shadow-premium"
            >
              <p className="text-xs font-semibold">Chat with us 💬</p>
              <p className="text-[10px] text-muted-foreground">We reply in minutes</p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={open ? "Close quick contact menu" : "Open quick contact menu"}
          className="relative w-14 h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-premium"
        >
          {/* Pulse ring */}
          {!open && (
            <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-30" />
          )}
          <AnimatePresence mode="wait">
            {open ? (
              <motion.span
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <X className="w-6 h-6" />
              </motion.span>
            ) : (
              <motion.span
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                {/* WhatsApp glyph */}
                <svg viewBox="0 0 24 24" className="w-7 h-7 fill-current" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </div>
  );
}

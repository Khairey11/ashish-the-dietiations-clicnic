"use client";

import * as React from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Cookie consent banner.
 *
 * Shows on first visit (until the user acknowledges). Stores the acknowledgement
 * in localStorage so it persists across sessions without setting a new cookie.
 *
 * This app uses only essential cookies (session + theme) — no advertising or
 * tracking cookies. So there's no granular preference toggle; just an
 * "acknowledge" button that links to the privacy policy for transparency.
 */
const STORAGE_KEY = "cookie-consent-acknowledged";

export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const ack = localStorage.getItem(STORAGE_KEY);
      if (!ack) setVisible(true);
    } catch {
      // localStorage may be blocked (private mode) — don't show the banner
      // repeatedly if we can't persist the dismissal.
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:max-w-sm z-[100] p-4 rounded-2xl border border-border bg-card shadow-premium"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Cookie className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold mb-1">We use essential cookies</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Only for login sessions and your theme preference. No ads, no tracking.{" "}
            <Link href="/privacy" className="text-primary font-medium hover:underline">
              Read the privacy policy
            </Link>
            .
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={dismiss} className="h-8 bg-gradient-to-r from-primary to-secondary">
              Got it
            </Button>
            <Button size="sm" variant="ghost" onClick={dismiss} className="h-8" aria-label="Dismiss">
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

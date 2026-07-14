"use client";

import * as React from "react";

/**
 * useGreeting — derive a personalised, locale-aware greeting for the signed-in user.
 *
 * Returns `null` on the server / before the user's name is available, then
 * computes a greeting based on the current hour in the timezone associated with
 * the browser's locale (`navigator.language`).
 *
 *   const g = useGreeting(user?.name);
 *   // { text: "Good morning", firstName: "Sneha", tz: "Asia/Katmandu", localTime: "9:42 AM" }
 *
 * Hour → greeting mapping:
 *   < 5            → "Good night"
 *   < 12           → "Good morning"
 *   < 17           → "Good afternoon"
 *   < 21           → "Good evening"
 *   else           → "Good night"
 *
 * On any unexpected error (e.g. an exotic locale that Intl can't resolve), the
 * hook returns `null` so callers can fall back to a plain label.
 */

export type Greeting = {
  text: string;
  firstName: string;
  tz: string;
  localTime: string;
};

export function useGreeting(fullName: string | null | undefined): Greeting | null {
  const [greeting, setGreeting] = React.useState<Greeting | null>(null);

  React.useEffect(() => {
    if (!fullName) {
      setGreeting(null);
      return;
    }
    try {
      const locale =
        typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";
      const tz = Intl.DateTimeFormat(locale).resolvedOptions().timeZone || "UTC";
      const now = new Date();

      // Hour in the user's timezone — drives the greeting word.
      const hourStr = new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        hour12: false,
        timeZone: tz,
      }).format(now);
      const hour = parseInt(hourStr, 10);
      const safeHour = Number.isFinite(hour) ? (hour === 24 ? 0 : hour) : 0;

      let text = "Hello";
      if (safeHour < 5) text = "Good night";
      else if (safeHour < 12) text = "Good morning";
      else if (safeHour < 17) text = "Good afternoon";
      else if (safeHour < 21) text = "Good evening";
      else text = "Good night";

      const trimmed = fullName.trim();
      const firstName = trimmed ? trimmed.split(/\s+/)[0] : "there";

      const localTime = new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: tz,
      }).format(now);

      setGreeting({ text, firstName, tz, localTime });
    } catch {
      setGreeting(null);
    }
  }, [fullName]);

  return greeting;
}

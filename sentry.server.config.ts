import * as Sentry from "@sentry/nextjs";

/**
 * Sentry server-side config.
 *
 * Activates only when SENTRY_DSN is set. Otherwise the SDK is a no-op.
 */
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  // Set tracesSampleRate to 1.0 to capture 100% of transactions for perf监控.
  // Lower this in production to reduce cost.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  // Only send events when explicitly configured.
  enabled: !!process.env.SENTRY_DSN,
  // Don't send events for noisy, non-actionable errors.
  ignoreErrors: [
    "NEXT_NOT_FOUND", // 404s from next/navigation
    "NEXT_REDIRECT",  // redirects from next/navigation
  ],
});

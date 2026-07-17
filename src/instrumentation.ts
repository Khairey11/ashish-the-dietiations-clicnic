/**
 * Sentry instrumentation hook — runs once on server startup.
 *
 * Requires SENTRY_DSN env var to be set. If unset, Sentry is a no-op
 * (the SDK initialises but doesn't send events).
 *
 * @see https://docs.sentry.io/platforms/javascript/guides/nextjs/
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.server.config");
  }
}

import * as Sentry from "@sentry/nextjs";

/**
 * Sentry client-side config.
 *
 * Activates only when NEXT_PUBLIC_SENTRY_DSN is set. Otherwise the SDK is a no-op.
 */
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
  // Replay is great for debugging client-side errors but adds ~50KB to the bundle.
  // Disable in dev, enable in prod if you want it.
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === "production" ? 0.5 : 1.0,
  integrations: [
    Sentry.replayIntegration({
      // Mask all text + inputs in replays to avoid leaking PII / medical data.
      maskAllText: true,
      maskAllInputs: true,
      blockAllMedia: true,
    }),
  ],
});

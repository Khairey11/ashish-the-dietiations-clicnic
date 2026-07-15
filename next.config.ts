import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

/**
 * Content-Security-Policy.
 *
 * Tuned for this app's actual third-party origins:
 *   - 'self'                  — same-origin scripts/styles/images
 *   - fonts.googleapis.com    — next/font/google CSS
 *   - fonts.gstatic.com       — Google Fonts woff2 files
 *   - data:                   — inline data URIs (favicons, small SVGs)
 *   - blob:                   — image previews from File API
 *
 * Note: this is intentionally strict. If a new third-party is added
 * (analytics, Stripe, etc.) it MUST be added here.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js dev + framer-motion in dev
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "media-src 'self'",
  "connect-src 'self' https://api.resend.com",
  "frame-ancestors 'self'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

// Sentry wrapper — no-op when SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN are unset.
// The SDK still loads but doesn't transmit, so there's no perf cost in dev.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Suppress noisy build logs.
  silent: true,
  // Disable source-map upload in dev — only needed in CI/prod builds where
  // SENTRY_AUTH_TOKEN is set.
  sourcemaps: {
    disable: process.env.NODE_ENV !== "production" || !process.env.SENTRY_AUTH_TOKEN,
  },
});

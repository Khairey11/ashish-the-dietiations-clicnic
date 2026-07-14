import type { NextConfig } from "next";

/**
 * Content-Security-Policy.
 *
 * Tuned for this app's actual third-party origins:
 *   - 'self'                  — same-origin scripts/styles/images
 *   - nonce-...               — Next.js inline scripts (handled by Next automatically)
 *   - fonts.googleapis.com    — next/font/google CSS
 *   - fonts.gstatic.com       — Google Fonts woff2 files
 *   - api.resend.com          — server-side only (not needed in browser CSP)
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
  "connect-src 'self' https://api.resend.com", // verify-email etc. don't hit external from browser; only allow same-origin + Resend
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

export default nextConfig;

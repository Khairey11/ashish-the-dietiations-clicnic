# 🔒 Comprehensive Project Audit Report
**Project:** The Dietitians Clinic  
**Date:** 2026-07-28  
**Auditor:** Automated Code Review  
**Stack:** Next.js 16, React 19, Prisma 6 (SQLite), TypeScript 5, Tailwind 4

---

## Executive Summary

The project is a **well-structured Next.js application** for a dietitians clinic with appointment booking, payment processing (Khalti/eSewa), client dashboards, an admin portal, and a blog/CMS. The codebase demonstrates **strong security fundamentals** in many areas (HMAC session management, CSRF protection, rate limiting, input validation with Zod, constant-time comparisons, security headers).

However, the audit identified **1 critical**, **3 high**, **5 medium**, and **several low-severity issues** that should be addressed before production deployment.

| Severity | Count |
|----------|-------|
| 🔴 Critical | 1 |
| 🟠 High | 3 |
| 🟡 Medium | 5 |
| 🔵 Low / Info | 8+ |

---

## 🔴 Critical Issues

### C1. Command Injection via Webhook Deploy Script
**File:** `src/app/api/webhook/route.ts` (lines 53–82)  
**CWE:** CWE-78 (OS Command Injection)

The `startBackgroundDeploy()` function interpolates attacker-controlled data (`pushedBy` and `commitMsg` from the GitHub payload) directly into a shell command string:

```typescript
function startBackgroundDeploy(pushedBy: string, commitMsg: string): void {
  const deployScript = [
    // ...
    `echo "Triggered by: ${pushedBy} — ${commitMsg}"`,  // ← INJECTION POINT
    // ...
  ].join("\n");
  const child = spawn("bash", ["-c", `${deployScript} >> /opt/dietitians-clinic/deploy.log 2>&1`], { ... });
}
```

**Impact:** Although the webhook signature is verified (so only GitHub can trigger it), a malicious commit message like `"; rm -rf / #"` would execute arbitrary shell commands on the production server as root. This is a supply-chain risk — any contributor who can push to `main` can achieve RCE.

**Fix:** Pass the variables as environment variables or arguments, never via string interpolation into a shell script:
```typescript
const child = spawn("bash", ["-c", deployScript], {
  detached: true,
  stdio: "ignore",
  env: { ...process.env, DEPLOY_PUSHED_BY: pushedBy, DEPLOY_COMMIT_MSG: commitMsg },
});
// In deployScript, reference "$DEPLOY_PUSHED_BY" and "$DEPLOY_COMMIT_MSG"
```

---

## 🟠 High Severity Issues

### H1. Path Traversal in File Cleanup
**File:** `src/lib/file-cleanup.ts` (lines 17–33)  
**CWE:** CWE-22 (Path Traversal)

The `deleteUploadByUrl()` function checks `url.startsWith("/uploads/")` but does not prevent directory traversal sequences:

```typescript
if (!url.startsWith("/uploads/")) return;
const cleanUrl = url.split("?")[0].split("#")[0];
const filePath = path.join(process.cwd(), "public", cleanUrl);
await unlink(filePath);
```

A URL like `/uploads/../../../etc/passwd` would resolve outside the uploads directory.

**Fix:** Resolve and verify the path stays within the uploads directory:
```typescript
const uploadsDir = path.resolve(process.cwd(), "public", "uploads");
const filePath = path.resolve(process.cwd(), "public", cleanUrl);
if (!filePath.startsWith(uploadsDir + path.sep)) return;
```

### H2. Dependency Vulnerabilities (npm audit)
**Result:** 12 high-severity vulnerabilities detected

| Package | Issue | Fix |
|---------|-------|-----|
| `brace-expansion` ≤5.0.7 | DoS via unbounded expansion (GHSA-mh99-v99m-4gvg) | Update eslint to v10+ (breaking) |
| `postcss` ≤8.5.17 | XSS + arbitrary file read via sourceMappingURL | Update next.js |
| `sharp` <0.35.0 | libvips CVEs (CVE-2026-33327/33328/35590/35591) | Update sharp |

**Fix:** Run `npm audit fix` for safe updates; evaluate `npm audit fix --force` (breaking changes) in a branch.

### H3. Default Credentials Printed in Deploy Script
**File:** `deploy.sh` (lines 209–215)

The deploy script prints default credentials to the terminal:
```bash
echo "  Admin login: aarav@thedietitiansclinic.com"
echo "  Admin password: admin123"
```

While the seed script (`scripts/seed.ts`) correctly reads passwords from environment variables, the deploy script's output implies weak default passwords exist. Any deployment that doesn't rotate these immediately is vulnerable.

**Fix:** Remove hardcoded credential hints from `deploy.sh`. Print only the email and instruct the admin to use the password set via `SEED_ADMIN_PASSWORD`.

---

## 🟡 Medium Severity Issues

### M1. In-Memory Rate Limiter Doesn't Work in Multi-Instance Deployments
**File:** `src/lib/ratelimit.ts`

The rate limiter uses a process-local `Map`, which means:
- Each server instance has its own bucket
- On serverless platforms (Vercel), each invocation may be a cold start with empty buckets
- The `start` script runs via Bun (single process), so this works on the current VPS deployment — but it will silently fail if the deployment model changes

**Fix:** Document this limitation clearly, or migrate to `@upstash/ratelimit` + Redis before scaling to multiple instances.

### M2. No Rate Limiting on Client API Routes
**Files:** `src/app/api/client/**/*.ts` (reports, measurements, meal-plans, onboarding, etc.)

The client-facing API routes (e.g., `POST /api/client/reports`, `POST /api/client/measurements`) do not have rate limiting, unlike the auth and payment routes. An authenticated client could spam these endpoints.

**Fix:** Add rate limiting to all client API mutation routes.

### M3. `fileUrl` from Client Body Trusted Without Validation
**File:** `src/app/api/client/reports/route.ts` (line 52)

```typescript
fileUrl: z.string().min(1).max(500),
```

The `fileUrl` is accepted from the client request body with only string length validation. A client could store any arbitrary URL (including external URLs or non-upload paths). Combined with the path traversal issue (H1), this could be exploited.

**Fix:** Validate that `fileUrl` starts with `/uploads/` and doesn't contain `..`.

### M4. No CSRF Token (Relies Solely on Origin Header)
**File:** `src/middleware.ts`

The CSRF protection relies entirely on the `Origin` header check. While this is generally effective in modern browsers, it:
- Is bypassed in older browsers that don't send `Origin`
- The production check rejects missing `Origin`, which is good — but dev mode allows missing `Origin`

**Recommendation:** Consider adding double-submit cookie CSRF tokens for defense-in-depth, especially for state-changing operations.

### M5. Session Cookie Name is `admin_session` for All Roles
**File:** `src/lib/auth.ts` (line 30)

The cookie name `admin_session` is used for all users including clients. While functionally harmless, it's misleading and could cause confusion during security audits or debugging.

**Fix:** Rename to `session` or `app_session`.

---

## 🔵 Low / Informational Issues

### L1. Extensive Use of `any` Type (99 ESLint Warnings)
**Files:** Multiple admin pages, especially `src/app/admin/settings/page.tsx` (20+ instances)

The codebase has 99 ESLint warnings, many of which are `@typescript-eslint/no-explicit-any`. The admin settings page is particularly affected.

### L2. Unused Imports and Variables
Many components have unused imports (e.g., `Star`, `BarChart`, `Badge`, `Loader2`). These add minor bundle bloat.

### L3. `<img>` Used Instead of `<Image />`
**Files:** `src/app/admin/settings/page.tsx:438`, `src/components/sections/booking.tsx:776`

Next.js `<Image />` should be used for optimization.

### L4. SQLite in Production
**File:** `prisma/schema.prisma` (line 3)

The schema comment states "production should switch to PostgreSQL." SQLite is being used with `file:`-based DB on the VPS. This has implications for:
- Concurrent write performance
- No built-in replication
- Potential DB corruption under high concurrency

### L5. GitHub Repo Name Typo
**File:** `src/app/api/admin/github-status/route.ts` (line 31)
```
"Khairey11/ashish-the-dietiations-clicnic"  // "dietiations" and "clicnic" are misspelled
```
This appears in both the route and `deploy.sh`. If the repo name is correct, this is a display issue; if not, GitHub status checks will fail.

### L6. Unencrypted Demo Phone Numbers in Seed
**File:** `scripts/seed.ts` — Demo client phone is `"+977 98XXXXXXXX"` (partially masked, acceptable).

### L7. Email HTML Construction Without Escaping
**File:** `src/lib/email.ts` (lines 95–100)

Email HTML interpolates user-controlled values (`opts.clientName`, `opts.service`, etc.) without HTML escaping. While these values come from the database (not directly from untrusted input), a stored XSS in the email client is possible if a user sets a malicious name.

**Fix:** HTML-escape all interpolated values in email templates.

### L8. Missing `try/catch` on `verifyPassword` Async Edge
**File:** `src/app/api/admin/login/route.ts` (line 63)

`verifyPassword` is synchronous but called without `await` — this is fine since it returns `boolean`, but it's worth noting that `scryptSync` is CPU-intensive and blocks the event loop. Under a brute-force attack (even with rate limiting), this could cause brief request queueing.

---

## ✅ Security Strengths (What's Done Right)

| Area | Implementation | Quality |
|------|---------------|---------|
| **Password Hashing** | scrypt with 16-byte salt, constant-time comparison | ✅ Excellent |
| **Session Management** | HMAC-signed cookies with sessionVersion for instant invalidation | ✅ Excellent |
| **CSRF Protection** | Origin header verification on all mutation routes | ✅ Good |
| **Rate Limiting** | Applied to login (10/15min), register (5/hr), forgot-password (3/hr), reset-password (5/hr), payment initiate (10/hr) | ✅ Good |
| **Input Validation** | Zod schemas on all API routes | ✅ Excellent |
| **Authorization** | Role-based helpers (`requireClient`, `requireAdmin`, `requireSuperAdmin`) with proper DB-level checks | ✅ Excellent |
| **Ownership Checks** | Client routes verify `patientId` belongs to authenticated user via `findFirst` | ✅ Excellent |
| **Security Headers** | CSP, X-Frame-Options, HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy | ✅ Excellent |
| **Cookie Security** | `httpOnly`, `secure` in production, `sameSite: lax` | ✅ Good |
| **Secret Management** | No hardcoded secrets; `WEBHOOK_SECRET` has no default and 503s if unset | ✅ Excellent |
| **Email Enumeration Prevention** | Forgot-password always returns success message | ✅ Good |
| **Payment Verification** | Server-side amount verification against DB (ignores URL-supplied amounts) | ✅ Excellent |
| **Webhook Signature** | HMAC-SHA256 verification with constant-time comparison | ✅ Good |
| **Seed Script** | Requires passwords via env vars, minimum 10 chars, no hardcoded defaults | ✅ Excellent |
| **`.gitignore`** | Properly excludes `.env*`, `*.db`, logs, uploads | ✅ Good |
| **Audit Logging** | All admin actions logged with before/after state | ✅ Good |
| **Password Reset** | Token expiry, single-use, sessionVersion bump on reset | ✅ Excellent |
| **Email Verification** | 24h token expiry, non-blocking send | ✅ Good |

---

## 📊 Code Quality Metrics

| Metric | Result |
|--------|--------|
| **ESLint** | ✅ 0 errors, 99 warnings |
| **TypeScript** | ✅ 0 errors (`tsc --noEmit` passes) |
| **Test Coverage** | ⚠️ Test infrastructure exists (Vitest, Playwright) but coverage not verified |
| **Architecture** | ✅ Clean separation: API routes → lib/actions → lib/db |
| **Error Handling** | ✅ All API routes have try/catch with generic error messages |

---

## 🎯 Priority Action Items

### Immediate (Before Production)
1. **Fix C1** — Command injection in webhook deploy script
2. **Fix H1** — Path traversal in file-cleanup.ts
3. **Fix H3** — Remove hardcoded credentials from deploy.sh
4. **Run** `npm audit fix` to address dependency vulnerabilities

### Short Term (1-2 Sprints)
5. **Fix M3** — Validate `fileUrl` in client report routes
6. **Fix M2** — Add rate limiting to client API routes
7. **Fix L7** — HTML-escape email template values
8. **Fix L5** — Correct GitHub repo name spelling

### Medium Term (Ongoing)
9. **Address L1** — Reduce `any` usage across admin pages
10. **Plan L4** — Evaluate migration to PostgreSQL for production scaling
11. **Consider M1** — Migrate rate limiter to Redis before multi-instance deployment
12. **Clean up** unused imports/variables (99 warnings)

---

## 📁 Files Reviewed

| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `next.config.ts` | CSP, security headers, Sentry config |
| `src/middleware.ts` | CSRF, auth guards, route protection |
| `src/lib/auth.ts` | Session management, role-based access |
| `src/lib/password.ts` | scrypt hashing, constant-time verify |
| `src/lib/ratelimit.ts` | In-memory rate limiter |
| `src/lib/audit.ts` | Audit log writer |
| `src/lib/email.ts` | Email service (Resend integration) |
| `src/lib/db.ts` | Prisma client singleton |
| `src/lib/file-cleanup.ts` | Upload file deletion |
| `src/lib/actions/payment-gateways.ts` | Khalti/eSewa payment integration |
| `src/app/api/webhook/route.ts` | GitHub auto-deploy webhook |
| `src/app/api/admin/login/route.ts` | Login endpoint |
| `src/app/api/admin/change-password/route.ts` | Password change |
| `src/app/api/admin/github-status/route.ts` | GitHub commit polling |
| `src/app/api/admin/payment-config/route.ts` | Payment config management |
| `src/app/api/auth/register/route.ts` | User registration |
| `src/app/api/auth/forgot-password/route.ts` | Password reset initiation |
| `src/app/api/auth/reset-password/route.ts` | Password reset completion |
| `src/app/api/payments/initiate/route.ts` | Payment initiation |
| `src/app/api/client/reports/route.ts` | Client reports CRUD |
| `src/app/api/client/reports/[id]/route.ts` | Client report deletion |
| `prisma/schema.prisma` | Database schema (724 lines) |
| `.gitignore` | File ignore rules |
| `deploy.sh` | VPS deployment script |
| `scripts/seed.ts` | Database seeding |

---

*This audit was conducted via static code analysis. Runtime testing (penetration testing, DAST) is recommended before production launch.*
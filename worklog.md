---
Task ID: google-login
Agent: main
Task: Unlock Google login for clients (was previously a disabled "Coming soon" button on /login).

Work Log:
- Reviewed existing auth setup: HMAC-signed `admin_session` cookie via `src/lib/auth.ts`, Prisma `User` + `Account` (NextAuth-compatible) models already present.
- Created `src/lib/google-oauth.ts`: PKCE helpers (randomToken, S256 challenge via Web Crypto), `getGoogleOAuthConfig()`, `buildAuthUrl()`, `exchangeCodeForTokens()`, `fetchGoogleUserInfo()`, cookie constants, constant-time `safeEqual()`.
- Created `src/app/api/auth/google/route.ts` (GET): generates state + verifier + challenge, stores them in short-lived httpOnly cookies, sanitizes `next`, 302s to Google's consent screen.
- Created `src/app/api/auth/google/callback/route.ts` (GET): verifies state, exchanges code, fetches userinfo, upserts User + Account in a transaction (links existing email users, otherwise creates CLIENT + empty Patient profile), writes audit log, sets `admin_session` cookie, redirects to /dashboard (or /dashboard/onboarding for brand-new users). All error paths redirect to /login?error=google_auth_failed&reason=...
- Updated `src/app/login/page.tsx`: Google button is now a real <a href="/api/auth/google?next=..."> with proper Google "G" logo colors, plus a useEffect that surfaces a toast when bounced back with `?error=google_auth_failed`. Apple button kept disabled.
- Type check (`tsc --noEmit`) and ESLint both pass.

Stage Summary:
- New files:
  - src/lib/google-oauth.ts
  - src/app/api/auth/google/route.ts
  - src/app/api/auth/google/callback/route.ts
- Modified files:
  - src/app/login/page.tsx (Google button enabled + error toast)
- No DB migration needed (Account model already existed).
- Required env vars before this works in production:
  - GOOGLE_CLIENT_ID
  - GOOGLE_CLIENT_SECRET
  - NEXT_PUBLIC_APP_URL  (e.g. https://thedietitiansclinic.com)
- Google Cloud Console: add `https://<NEXT_PUBLIC_APP_URL>/api/auth/google/callback` to the OAuth client's authorized redirect URIs.

---
Task ID: google-login-revert
Agent: main
Task: User said "remove it" — fully revert the Google login feature added in task `google-login`.

Work Log:
- Deleted `src/lib/google-oauth.ts`.
- Deleted `src/app/api/auth/google/route.ts` and `src/app/api/auth/google/callback/route.ts`, then removed the now-empty `src/app/api/auth/google/callback/` and `src/app/api/auth/google/` directories.
- Reverted `src/app/login/page.tsx`:
  - Removed the `React.useEffect` block that surfaced the OAuth error toast.
  - Restored the original disabled `Button` (title="Coming soon") for Google, with the original monochrome Google icon SVG. Apple button was already disabled — left as-is.
- Verified: `npx tsc --noEmit` exits 0 (no errors), `npx eslint src/app/login/page.tsx` passes, no leftover google-oauth references in `src/app/api/auth/` (only `forgot-password`, `register`, `reset-password` remain).

Stage Summary:
- The codebase is back to the pre-Google-login state. No env vars required, no Google Cloud Console setup needed.
- Login page once again shows the Google button as disabled with "Coming soon".

---
Task ID: dashboard-greeting
Agent: main
Task: Add a personalised greeting on the client dashboard based on the user's first name, using the timezone derived from their browser locale.

Work Log:
- Reviewed `src/app/dashboard/page.tsx` — header previously rendered `{userName} 👋` with a hardcoded `en-US` date string and no timezone awareness.
- Added a new `greeting` state slot `{ text, firstName, tz, localTime } | null`.
- Added a `useEffect` keyed on `data?.user?.name` that:
  - Reads `navigator.language` (browser locale, e.g. `en-GB`, `ne-NP`, `es-ES`).
  - Resolves the timezone via `Intl.DateTimeFormat(locale).resolvedOptions().timeZone` — this is the timezone associated with the user's locale environment (e.g. `Asia/Katmandu`).
  - Computes the current hour in that timezone via `Intl.DateTimeFormat(locale, { hour: 'numeric', hour12: false, timeZone: tz })`.
  - Maps the hour to a greeting word: <5 → "Good night", <12 → "Good morning", <17 → "Good afternoon", <21 → "Good evening", else "Good night".
  - Extracts the first name by splitting `user.name` on whitespace and taking the first token (fallback "there").
  - Also formats the current local time in the user's locale + timezone for display.
  - Wrapped in try/catch — any failure leaves `greeting` null and the header falls back to the previous plain-name rendering.
- Updated the header JSX:
  - `<h1>` now shows `{greeting.text}, {greeting.firstName} 👋` (e.g. "Good morning, Sneha 👋") when greeting is available, otherwise falls back to `{userName} 👋`.
  - The `<p>` date line now appends `· <Clock icon> <localTime> <tz>` (e.g. "Tuesday, July 15 · 9:42 AM Asia/Katmandu").
- Imported `Clock` from `lucide-react`.
- Type-check (`tsc --noEmit`) and ESLint both pass.

Stage Summary:
- Files modified: `src/app/dashboard/page.tsx` only.
- No env vars, no DB changes, no new dependencies.
- Behaviour is client-only (uses `navigator.language` and `Intl`), so SSR renders the loading skeleton and the greeting only appears after data loads — no hydration mismatch.

---
Task ID: admin-greeting
Agent: main
Task: Add the same time-of-day greeting to the admin dashboard, using the admin's first name and their browser-locale timezone.

Work Log:
- Reviewed `src/app/admin/page.tsx` — header previously rendered "Admin Portal" with a sub-line `Welcome back, {adminUser?.name || "Admin"}` and no timezone awareness.
- Extracted the greeting logic from the client dashboard into a new shared hook `src/lib/use-greeting.ts` so both dashboards stay in sync:
  - Hook signature: `useGreeting(fullName: string | null | undefined): Greeting | null`
  - Returns `{ text, firstName, tz, localTime }` computed from `navigator.language` + `Intl.DateTimeFormat(...).resolvedOptions().timeZone` + the current hour in that timezone.
  - Same hour → greeting mapping: <5 Good night · <12 Good morning · <17 Good afternoon · <21 Good evening · else Good night.
  - Returns `null` on the server / while `fullName` is empty / on any Intl error — callers fall back to plain labels.
- Refactored `src/app/dashboard/page.tsx` to call `useGreeting(data?.user?.name)` instead of the inlined `useEffect` + `useState`. Visual output unchanged.
- Wired the hook into `src/app/admin/page.tsx`:
  - Imported `Clock` from `lucide-react` and `useGreeting` from `@/lib/use-greeting`.
  - Added `const greeting = useGreeting(adminUser?.name);` next to the existing `adminUser` state.
  - Updated the top bar `<h1>`: now shows `{greeting.text}, {greeting.firstName}` (e.g. "Good morning, Priya") when greeting is available; falls back to "Admin Portal".
  - Updated the sub-line to show date · local time · timezone (e.g. "Tuesday, July 15, 2026 · 🕘 9:42 AM Asia/Katmandu"). Falls back to "Welcome back, {name}" if the greeting hook returned null.
- Type-check (`tsc --noEmit`) and ESLint both pass on all three files.

Stage Summary:
- New file: `src/lib/use-greeting.ts` (shared hook).
- Modified files: `src/app/dashboard/page.tsx` (refactored to use the hook — no behaviour change), `src/app/admin/page.tsx` (added greeting + local time/timezone in header).
- Both dashboards now greet the signed-in user by first name with a time-of-day word computed from the timezone of their browser locale.



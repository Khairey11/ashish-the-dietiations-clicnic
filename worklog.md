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

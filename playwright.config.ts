import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright e2e config.
 *
 * Run tests: `bun run test:e2e`
 * Run with UI: `bunx playwright test --ui`
 *
 * NOTE: e2e tests require the dev server running on :3000. Playwright will
 * auto-start it via `webServer` below.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false, // sequential — shared DB
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60 * 1000,
  },
});

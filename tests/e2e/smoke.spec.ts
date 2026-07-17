import { test, expect } from "@playwright/test";

/**
 * E2E smoke tests — cover the most critical public flows.
 *
 * These run against the dev server (auto-started by Playwright).
 * They don't require auth — they just verify the public site loads.
 */

test.describe("public site smoke", () => {
  test("homepage loads + shows hero CTA", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1").first()).toBeVisible();
    // The hero should mention something nutrition-related.
    await expect(page.locator("body")).toContainText(/nutrition|dietitian|health/i);
  });

  test("navigation to /services works", async ({ page }) => {
    await page.goto("/");
    await page.click('a[href="/services"]');
    await expect(page).toHaveURL(/\/services/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("navigation to /programs works", async ({ page }) => {
    await page.goto("/programs");
    await expect(page).toHaveURL(/\/programs/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("navigation to /blog works", async ({ page }) => {
    await page.goto("/blog");
    await expect(page).toHaveURL(/\/blog/);
    await expect(page.locator("h1").first()).toBeVisible();
  });

  test("login page renders the sign-in form", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test("privacy policy page loads", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveURL(/\/privacy/);
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("body")).toContainText(/privacy/i);
    await expect(page.locator("body")).toContainText(/GDPR|data protection/i);
  });

  test("unauthenticated /admin redirects to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("health endpoint returns 200 + ok status", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.db).toBe(true);
    expect(body.latencyMs).toBeGreaterThanOrEqual(0);
  });

  test("cookie consent banner appears + dismisses", async ({ page }) => {
    await page.goto("/");
    // The banner should appear on first visit.
    const banner = page.locator('[role="dialog"][aria-label="Cookie notice"]');
    await expect(banner).toBeVisible({ timeout: 5000 });
    // Click "Got it".
    await banner.getByRole("button", { name: "Got it" }).click();
    await expect(banner).not.toBeVisible();
    // Reload — banner should stay dismissed (localStorage).
    await page.reload();
    await expect(banner).not.toBeVisible();
  });
});

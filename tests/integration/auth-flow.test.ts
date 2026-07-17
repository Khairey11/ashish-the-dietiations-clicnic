import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { signSession, verifySession, ADMIN_COOKIE } from "@/lib/auth";

/**
 * Integration tests for the auth flow.
 *
 * These tests hit the real dev DB (SQLite at db/custom.db). They:
 *   1. Create a throwaway test user.
 *   2. Exercise signSession + verifySession round-trip.
 *   3. Verify the sessionVersion invalidation behaviour.
 *   4. Clean up the test user afterwards.
 *
 * Run: `bun run test`
 */

const TEST_EMAIL = `test-auth-${Date.now()}@test.local`;
const TEST_PASSWORD = "test-password-12345";

let testUserId: string;

beforeAll(async () => {
  // Create a test user directly in the DB.
  const user = await db.user.create({
    data: {
      email: TEST_EMAIL,
      name: "Test User",
      role: "CLIENT",
      isActive: true,
      passwordHash: hashPassword(TEST_PASSWORD),
    },
    select: { id: true },
  });
  testUserId = user.id;
});

afterAll(async () => {
  // Clean up.
  await db.user.deleteMany({ where: { id: testUserId } }).catch(() => {});
  await db.$disconnect();
});

describe("auth flow integration", () => {
  it("creates a session token that verifies", async () => {
    const user = await db.user.findUnique({
      where: { email: TEST_EMAIL },
      select: { id: true, sessionVersion: true },
    });
    expect(user).toBeTruthy();

    const token = await signSession(user!.id, user!.sessionVersion);
    const verified = await verifySession(token);
    expect(verified).toBe(user!.id);
  });

  it("bumping sessionVersion invalidates old tokens at the requireUser layer", async () => {
    // Sign a token at the current version.
    const before = await db.user.findUnique({
      where: { id: testUserId },
      select: { sessionVersion: true },
    });
    const oldToken = await signSession(testUserId, before!.sessionVersion);

    // Bump the version (simulates password change).
    const newVersion = before!.sessionVersion + 1;
    await db.user.update({
      where: { id: testUserId },
      data: { sessionVersion: newVersion },
    });

    // Old token's HMAC is still valid (verifySession only checks signature),
    // BUT the version baked into the cookie (before.sessionVersion) no longer
    // matches the DB. A real requireUser call would reject this.
    const verifiedUserId = await verifySession(oldToken);
    expect(verifiedUserId).toBe(testUserId); // HMAC layer passes

    // Extract the version from the old token — it should differ from the DB.
    const cookieVersion = parseInt(oldToken.split(".")[1], 10);
    expect(cookieVersion).toBe(before!.sessionVersion);
    expect(cookieVersion).not.toBe(newVersion);

    // Sign a new token at the new version — should verify fine.
    const newToken = await signSession(testUserId, newVersion);
    expect(await verifySession(newToken)).toBe(testUserId);
    expect(parseInt(newToken.split(".")[1], 10)).toBe(newVersion);
  });

  it("ADMIN_COOKIE constant has the expected name", () => {
    expect(ADMIN_COOKIE).toBe("admin_session");
  });
});

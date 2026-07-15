import { describe, it, expect, beforeAll } from "vitest";
import { signSession, verifySession } from "@/lib/auth";

beforeAll(() => {
  // Ensure a stable secret for the test run.
  process.env.ADMIN_SESSION_SECRET = "test-secret-please-do-not-use-in-production-32chars";
});

describe("session token signing + verifying", () => {
  it("signs + verifies a token for a user at version 0", async () => {
    const token = await signSession("user-abc", 0);
    expect(token).toMatch(/^user-abc\.0\./);
    const userId = await verifySession(token);
    expect(userId).toBe("user-abc");
  });

  it("signs + verifies a token at version > 0", async () => {
    const token = await signSession("user-xyz", 7);
    expect(token).toMatch(/^user-xyz\.7\./);
    const userId = await verifySession(token);
    expect(userId).toBe("user-xyz");
  });

  it("rejects a tampered userId", async () => {
    const token = await signSession("user-real", 0);
    // Replace the userId prefix with a different one.
    const tampered = "user-fake" + token.slice("user-real".length);
    const userId = await verifySession(tampered);
    expect(userId).toBeNull();
  });

  it("rejects a tampered sessionVersion", async () => {
    const token = await signSession("user-1", 0);
    // Bump the version digit; signature should now mismatch.
    const tampered = token.replace(/^user-1\.0\./, "user-1.1.");
    const userId = await verifySession(tampered);
    expect(userId).toBeNull();
  });

  it("rejects a token with the wrong signature", async () => {
    const token = await signSession("user-2", 3);
    const parts = token.split(".");
    const tampered = `${parts[0]}.${parts[1]}.deadbeefinvalidsignature`;
    const userId = await verifySession(tampered);
    expect(userId).toBeNull();
  });

  it("rejects undefined / empty / malformed tokens", async () => {
    expect(await verifySession(undefined)).toBeNull();
    expect(await verifySession("")).toBeNull();
    expect(await verifySession("just-one-part")).toBeNull();
    expect(await verifySession("two.parts")).toBeNull(); // need 3 parts
  });

  it("bumping sessionVersion invalidates old tokens", async () => {
    // User logs in at version 0.
    const oldToken = await signSession("user-3", 0);
    expect(await verifySession(oldToken)).toBe("user-3");

    // Password is changed → version bumped to 1.
    // The OLD token still verifies at the HMAC layer (we only check the
    // signature, not the version — that happens in requireUser). But the
    // NEW token has a different payload, and the old one would fail the
    // sessionVersion comparison in requireUser.
    const newToken = await signSession("user-3", 1);
    expect(newToken).not.toBe(oldToken);
    expect(await verifySession(newToken)).toBe("user-3");

    // The OLD token still passes HMAC verification (verifySession only
    // checks signature, not version). The version mismatch is caught by
    // requireUser when it queries the DB.
    expect(await verifySession(oldToken)).toBe("user-3");
  });
});

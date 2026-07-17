import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password hashing", () => {
  it("hashes a password with scrypt", () => {
    const hash = hashPassword("my-password-123");
    // Format: salt:hash (both hex)
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
    // Salt should be 32 hex chars (16 bytes)
    const [salt] = hash.split(":");
    expect(salt).toHaveLength(32);
  });

  it("produces different hashes for the same password (random salt)", () => {
    const a = hashPassword("same-password");
    const b = hashPassword("same-password");
    expect(a).not.toBe(b);
  });

  it("verifies a correct password", () => {
    const hash = hashPassword("correct-password-123");
    expect(verifyPassword("correct-password-123", hash)).toBe(true);
  });

  it("rejects an incorrect password", () => {
    const hash = hashPassword("correct-password-123");
    expect(verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("rejects empty password", () => {
    const hash = hashPassword("real-password");
    expect(verifyPassword("", hash)).toBe(false);
  });

  it("handles malformed hash gracefully", () => {
    expect(verifyPassword("anything", "not-a-valid-hash")).toBe(false);
    expect(verifyPassword("anything", "")).toBe(false);
    expect(verifyPassword("anything", "missing-colon")).toBe(false);
  });
});

/**
 * Password hashing and verification using scrypt (Node built-in).
 * Hash format: "<salt>:<derived>" (hex)
 */

import { scryptSync, randomBytes } from "node:crypto";

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(plain: string, hash: string): boolean {
  try {
    if (!hash.includes(":")) return false;
    const [salt, derived] = hash.split(":");
    const buf = scryptSync(plain, salt, 64);
    return buf.toString("hex") === derived;
  } catch {
    return false;
  }
}

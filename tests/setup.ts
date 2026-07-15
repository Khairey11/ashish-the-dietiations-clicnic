/**
 * Vitest setup — runs before every test file.
 *
 * Loads the same .env Next.js uses so tests can talk to the dev DB.
 */
import "dotenv/config";

// Ensure we're talking to the dev DB (not a prod one).
process.env.DATABASE_URL = process.env.DATABASE_URL || "file:/home/z/my-project/db/custom.db";

// Use a stable HMAC secret in tests.
process.env.ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || "test-secret-please-do-not-use-in-production-32chars";

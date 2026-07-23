// One-off script to set admin + demo client passwords.
// Passwords are read from env vars so they never land in the repo.
//
// Usage:
//   SEED_ADMIN_PASSWORD="..." SEED_CLIENT_PASSWORD="..." bun run scripts/set-admin-password.ts
//
// If env vars are unset, the script aborts with a clear message.

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

function requirePassword(envVar: string, description: string): string {
  const v = process.env[envVar];
  if (!v) {
    console.error(`❌ ${envVar} is not set. Required for ${description}.`);
    console.error(`   Example: ${envVar}="change-me-now" bun run scripts/set-admin-password.ts`);
    process.exit(1);
  }
  if (v.length < 10) {
    console.error(`❌ ${envVar} must be at least 10 characters long.`);
    process.exit(1);
  }
  return v;
}

async function main() {
  const adminPassword = requirePassword("SEED_ADMIN_PASSWORD", "the admin user");
  const clientPassword = requirePassword("SEED_CLIENT_PASSWORD", "the demo client");

  const admin = await prisma.user.update({
    where: { email: "aarav@thedietitiansclinic.com" },
    data: { passwordHash: hashPassword(adminPassword) },
    select: { email: true, role: true },
  });
  console.log("✅ Admin password set for:", admin);

  const client = await prisma.user.update({
    where: { email: "sneha@example.com" },
    data: { passwordHash: hashPassword(clientPassword) },
    select: { email: true, role: true },
  });
  console.log("✅ Demo client password set for:", client);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

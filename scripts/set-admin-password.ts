// One-off script to set admin password (run after seed if admin user already existed)
import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";

const prisma = new PrismaClient();

function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

async function main() {
  const updated = await prisma.user.update({
    where: { email: "aarav@thedietitiansclinic.health" },
    data: { passwordHash: hashPassword("admin123") },
    select: { email: true, role: true },
  });
  console.log("✅ Admin password set for:", updated);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

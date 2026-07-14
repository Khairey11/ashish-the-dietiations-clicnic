// One-off script to set admin + demo client passwords (run after seed if users already existed)
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.update({
    where: { email: "aarav@thedietitiansclinic.health" },
    data: { passwordHash: hashPassword("admin123") },
    select: { email: true, role: true },
  });
  console.log("✅ Admin password set for:", admin);

  const client = await prisma.user.update({
    where: { email: "sneha@example.com" },
    data: { passwordHash: hashPassword("client123") },
    select: { email: true, role: true },
  });
  console.log("✅ Demo client password set for:", client);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

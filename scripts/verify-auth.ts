import { PrismaClient } from "@prisma/client";
import { verifyPassword } from "../src/lib/password";

const prisma = new PrismaClient();

async function main() {
  // 1. Find admin and test password verification
  const admin = await prisma.user.findFirst({
    where: { role: "SUPER_ADMIN" },
    select: { email: true, passwordHash: true, isActive: true },
  });

  if (!admin || !admin.passwordHash) {
    console.log("FAIL: No admin user with password found");
    return;
  }

  const passwordOk = verifyPassword("AdminPass123!", admin.passwordHash);
  console.log("Password verify test:", passwordOk ? "PASS" : "FAIL");
  console.log("Admin account:", admin.email, "| isActive:", admin.isActive);

  // 2. Test dietitian password
  const dietitian = await prisma.user.findFirst({
    where: { role: "DIETITIAN" },
    select: { email: true, passwordHash: true },
  });
  if (dietitian && dietitian.passwordHash) {
    const dOk = verifyPassword("Dietitian123", dietitian.passwordHash);
    console.log("Dietitian password verify:", dOk ? "PASS" : "FAIL");
  }

  // 3. Test client password
  const client = await prisma.user.findFirst({
    where: { role: "CLIENT" },
    select: { email: true, passwordHash: true },
  });
  if (client && client.passwordHash) {
    const cOk = verifyPassword("ClientPass123!", client.passwordHash);
    console.log("Client password verify:", cOk ? "PASS" : "FAIL");
  }

  // 4. Update site setting brand name
  await prisma.siteSetting.upsert({
    where: { key: "clinic_name" },
    update: { value: "The Dietitian's Clinic" },
    create: { key: "clinic_name", value: "The Dietitian's Clinic" },
  });
  console.log("Site setting 'clinic_name' updated to: The Dietitian's Clinic");

  // 5. Show all roles
  const roles = await prisma.user.groupBy({
    by: ["role"],
    _count: { role: true },
  });
  console.log("User roles:", JSON.stringify(roles));

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
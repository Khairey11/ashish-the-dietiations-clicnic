/**
 * One-off script to update site settings from old brand to new brand.
 *
 * Run: bun run scripts/update-brand.ts
 *
 * Updates the SiteSetting table with the new Ashish Nutrition Clinic brand.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const updates: Record<string, string> = {
  clinic_name: "Ashish Nutrition Clinic",
  clinic_email: "ashish@thedietitiansclinic.com",
  clinic_phone: "+977 9800000000",
  clinic_phone_raw: "+9779800000000",
  clinic_address: "Kathmandu, Nepal",
  whatsapp_number: "+977 9800000000",
  whatsapp_raw: "9779800000000",
};

async function main() {
  console.log("🔄 Updating site settings to Ashish Nutrition Clinic...");

  for (const [key, value] of Object.entries(updates)) {
    const result = await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    console.log(`  ✅ ${key}: ${result.value}`);
  }

  console.log("\n✅ Brand update complete!");
}

main()
  .catch((e) => {
    console.error("❌ Update failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

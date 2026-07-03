// Seed script for The Dietitian's Clinic
// Run: bun run db:seed

import { PrismaClient, UserRole, LeadStatus, LeadSource } from "@prisma/client";
import { scryptSync, randomBytes } from "node:crypto";
import { services, programs, dietitians, blogPosts, faqs, testimonials } from "../src/lib/data";

const prisma = new PrismaClient();

/**
 * Hash a password using scrypt (Node built-in) — format: "<salt>:<derived>" (hex).
 * Matches the verifyPassword implementation in src/app/api/admin/login/route.ts.
 */
function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(plain, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================
  // 1. USERS (Admin + Dietitians + Demo Client)
  // ============================================================
  console.log("→ Creating users...");

  const adminUser = await prisma.user.upsert({
    where: { email: "aarav@thedietitiansclinic.health" },
    update: {},
    create: {
      email: "aarav@thedietitiansclinic.health",
      name: "Aarav K.C.",
      phone: "+977 9800000001",
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      // Default admin password — change immediately after first login.
      passwordHash: hashPassword("admin123"),
    },
  });

  const dietitianUsers: Array<{ user: { id: string; name: string | null }; data: typeof dietitians[number] }> = [];
  for (const d of dietitians) {
    const email = d.id.includes("-")
      ? `${d.id.replace(/-/g, ".")}@thedietitiansclinic.health`
      : `${d.id}@thedietitiansclinic.health`;
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        name: d.name,
        phone: "+977 9800000" + Math.floor(Math.random() * 999).toString().padStart(3, "0"),
        role: UserRole.DIETITIAN,
        isActive: true,
      },
    });
    dietitianUsers.push({ user, data: d });
  }

  // Demo client
  const clientUser = await prisma.user.upsert({
    where: { email: "sneha@example.com" },
    update: {},
    create: {
      email: "sneha@example.com",
      name: "Sneha Karki",
      phone: "+977 98XXXXXXXX",
      role: UserRole.CLIENT,
      isActive: true,
    },
  });

  // ============================================================
  // 2. DIETITIANS
  // ============================================================
  console.log("→ Creating dietitians...");

  for (const { user, data } of dietitianUsers) {
    await prisma.dietitian.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        name: data.name,
        credentials: data.credentials,
        specialty: data.specialty,
        bio: data.bio,
        experience: data.experience,
        languages: JSON.stringify(data.languages),
        rating: data.rating,
        reviewsCount: data.reviews,
        initials: data.initials,
        accent: data.accent,
        availability: data.availability,
        focus: JSON.stringify(data.focus),
        isActive: true,
      },
    });
  }

  // ============================================================
  // 3. PATIENT
  // ============================================================
  console.log("→ Creating demo patient...");

  const firstDietitian = await prisma.dietitian.findFirst();
  if (firstDietitian) {
    await prisma.patient.upsert({
      where: { userId: clientUser.id },
      update: {},
      create: {
        userId: clientUser.id,
        dietitianId: firstDietitian.id,
        dateOfBirth: new Date("1995-04-12"),
        gender: "FEMALE",
        height: 165,
        startingWeight: 78,
        currentWeight: 67.2,
        targetWeight: 62,
        bodyFatPct: 24,
        primaryGoal: "Lose 11 kg in 16 weeks and regulate PCOS symptoms",
        condition: "PCOS",
        city: "Kathmandu",
        country: "Nepal",
        startDate: new Date("2026-03-15"),
      },
    });
  }

  // ============================================================
  // 4. SERVICES
  // ============================================================
  console.log("→ Creating services...");

  for (const s of services) {
    await prisma.service.upsert({
      where: { slug: s.slug },
      update: {},
      create: {
        slug: s.slug,
        title: s.title,
        tagline: s.tagline,
        problem: s.problem,
        solution: s.solution,
        benefits: JSON.stringify(s.benefits),
        duration: s.duration,
        accent: s.accent,
        category: s.category.toUpperCase().replace("-", "_") as any,
        iconName: (s.icon as any).displayName || s.icon.name || "Activity",
        isActive: true,
        sortOrder: services.indexOf(s),
      },
    });
  }

  // ============================================================
  // 5. PROGRAMS
  // ============================================================
  console.log("→ Creating programs...");

  for (const p of programs) {
    await prisma.program.upsert({
      where: { slug: p.id },
      update: {},
      create: {
        slug: p.id,
        duration: p.duration,
        days: p.days,
        price: p.price,
        originalPrice: p.originalPrice,
        tagline: p.tagline,
        features: JSON.stringify(p.features),
        support: JSON.stringify(p.support),
        accent: p.accent,
        isPopular: p.popular || false,
        isActive: true,
        sortOrder: programs.indexOf(p),
      },
    });
  }

  // ============================================================
  // 6. BLOG CATEGORIES & POSTS
  // ============================================================
  console.log("→ Creating blog content...");

  const categoriesMap = new Map<string, string>();
  for (const post of blogPosts) {
    if (!categoriesMap.has(post.category)) {
      const cat = await prisma.category.upsert({
        where: { slug: post.category.toLowerCase().replace(/\s+/g, "-") },
        update: {},
        create: {
          name: post.category,
          slug: post.category.toLowerCase().replace(/\s+/g, "-"),
        },
      });
      categoriesMap.set(post.category, cat.id);
    }
  }

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.id },
      update: {},
      create: {
        slug: post.id,
        title: post.title,
        excerpt: post.excerpt,
        content: post.excerpt,
        categoryId: categoriesMap.get(post.category),
        tags: JSON.stringify(post.tags),
        coverAccent: post.accent,
        readingTime: post.readingTime,
        isFeatured: post.featured || false,
        isPublished: true,
        publishedAt: new Date(post.date),
        views: Math.floor(Math.random() * 5000) + 500,
      },
    });
  }

  // ============================================================
  // 7. FAQS
  // ============================================================
  console.log("→ Creating FAQs...");

  for (const faq of faqs) {
    await prisma.fAQ.create({
      data: {
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        isActive: true,
        sortOrder: faqs.indexOf(faq),
      },
    });
  }

  // ============================================================
  // 8. TESTIMONIALS
  // ============================================================
  console.log("→ Creating testimonials...");

  for (const t of testimonials) {
    await prisma.testimonial.create({
      data: {
        name: t.name,
        age: t.age,
        city: t.city,
        condition: t.condition,
        rating: t.rating,
        beforeWeight: t.beforeWeight,
        afterWeight: t.afterWeight,
        duration: t.duration,
        quote: t.quote,
        highlight: t.highlight,
        initials: t.initials,
        accent: t.accent,
        tag: t.tag,
        isApproved: true,
        isFeatured: true,
      },
    });
  }

  // ============================================================
  // 9. LEADS (demo data)
  // ============================================================
  console.log("→ Creating leads...");

  const demoLeads = [
    { name: "Rajan K.", email: "rajan@example.com", phone: "+977 9811111111", message: "Interested in PCOS diet plan", service: "pcos-diet" },
    { name: "Pooja S.", email: "pooja@example.com", phone: "+977 9822222222", message: "Looking for pregnancy nutrition guidance", service: "pregnancy-nutrition" },
    { name: "Dipesh M.", email: "dipesh@example.com", phone: "+977 9833333333", message: "Want to gain muscle mass", service: "weight-gain" },
    { name: "Sita R.", email: "sita@example.com", phone: "+977 9844444444", message: "Diabetes management enquiry", service: "diabetes-diet" },
    { name: "Anil B.", email: "anil@example.com", phone: "+977 9855555555", message: "Corporate wellness program for 50 employees", service: "corporate-wellness" },
  ];

  const leadStatuses: LeadStatus[] = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.BOOKED, LeadStatus.CONVERTED];
  const leadSources: LeadSource[] = [LeadSource.ORGANIC, LeadSource.REFERRAL, LeadSource.SOCIAL, LeadSource.DIRECT, LeadSource.AD];

  for (let i = 0; i < demoLeads.length; i++) {
    const l = demoLeads[i];
    await prisma.lead.create({
      data: {
        ...l,
        source: leadSources[i % leadSources.length],
        status: leadStatuses[i % leadStatuses.length],
      },
    });
  }

  // ============================================================
  // 10. SITE SETTINGS
  // ============================================================
  console.log("→ Creating site settings...");

  const settings = [
    // Clinic contact
    { key: "clinic_name", value: "The Dietitian's Clinic" },
    { key: "clinic_phone", value: "+977-1-4445566" },
    { key: "clinic_phone_raw", value: "+97714445566" },
    { key: "clinic_email", value: "care@thedietitiansclinic.health" },
    { key: "clinic_address", value: "Banasthali, Baluwatar-4, Kathmandu 44600, Nepal" },
    { key: "whatsapp_number", value: "+977 9800000000" },
    { key: "whatsapp_raw", value: "9779800000000" },
    { key: "weekday_hours", value: "7:00 AM – 8:00 PM" },
    { key: "saturday_hours", value: "8:00 AM – 6:00 PM" },
    { key: "default_currency", value: "NPR" },
    { key: "default_locale", value: "en-US" },

    // Payment: Khalti
    { key: "payment_khalti_enabled", value: "true" },
    { key: "payment_khalti_merchant_mobile", value: "9800000000" },
    { key: "payment_khalti_qr_url", value: "" },        // Admin uploads via /admin/settings
    { key: "payment_khalti_api_key", value: "" },        // Set via env: KHALTI_API_KEY
    { key: "payment_khalti_secret", value: "" },         // Set via env: KHALTI_SECRET

    // Payment: eSewa
    { key: "payment_esewa_enabled", value: "true" },
    { key: "payment_esewa_id", value: "thedietitiansclinic" },
    { key: "payment_esewa_qr_url", value: "" },          // Admin uploads via /admin/settings
    { key: "payment_esewa_merchant_code", value: "" },   // Set via env: ESEWA_MERCHANT_CODE

    // Payment: Bank transfer
    { key: "payment_bank_enabled", value: "true" },
    { key: "payment_bank_name", value: "Nepal Investment Mega Bank" },
    { key: "payment_bank_account_name", value: "The Dietitian's Clinic Pvt. Ltd." },
    { key: "payment_bank_account_number", value: "01234567890123" },
    { key: "payment_bank_branch", value: "Baluwatar Branch" },
    { key: "payment_bank_qr_url", value: "" },           // Admin uploads via /admin/settings

    // Payment: global
    { key: "payment_proof_mode", value: "whatsapp" },    // "whatsapp" or "upload"
    { key: "payment_instructions", value: "After paying, please send the screenshot to our WhatsApp to confirm your booking." },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    });
  }

  console.log("\n✅ Seed complete!");
  console.log(`   - ${dietitianUsers.length} dietitians`);
  console.log(`   - ${services.length} services`);
  console.log(`   - ${programs.length} programs`);
  console.log(`   - ${blogPosts.length} blog posts`);
  console.log(`   - ${faqs.length} FAQs`);
  console.log(`   - ${testimonials.length} testimonials`);
  console.log(`   - ${demoLeads.length} leads`);
  console.log(`   - 1 admin user (aarav@thedietitiansclinic.health)`);
  console.log(`   - 1 demo client (sneha@example.com)`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

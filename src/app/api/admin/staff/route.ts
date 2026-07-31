import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { STAFF_ROLES } from "@/lib/permissions";
import type { UserRole } from "@prisma/client";

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;
  try {
    const staff = await db.user.findMany({
      where: { role: { not: "CLIENT" } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, name: true, email: true, phone: true, role: true,
        isActive: true, avatarUrl: true, lastLoginAt: true, createdAt: true,
        staffProfile: { select: { id: true, bio: true, photoUrl: true, department: true, employmentType: true, employeeId: true, qualifications: true, specialties: true, isVerified: true, joinedAt: true } },
        dietitian: { select: { id: true, specialty: true, rating: true, _count: { select: { patients: true } } } },
        _count: { select: { blogPosts: true, auditLogs: true } },
      },
    });
    return NextResponse.json({ success: true, data: staff });
  } catch (error) {
    console.error("Failed to fetch staff:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch staff" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(7).max(32).optional(),
  password: z.string().min(8).max(128),
  role: z.enum(STAFF_ROLES as [UserRole, ...UserRole[]]),
  bio: z.string().max(2000).optional(),
  qualifications: z.array(z.string()).optional(),
  specialties: z.array(z.string()).optional(),
  languages: z.array(z.string()).optional(),
  photoUrl: z.string().max(500).optional(),
  resumeUrl: z.string().max(500).optional(),
  department: z.string().max(100).optional(),
  employeeId: z.string().max(50).optional(),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "CONSULTANT"]).optional(),
  workPhone: z.string().max(32).optional(),
  workEmail: z.string().email().max(160).optional(),
  linkedinUrl: z.string().max(500).optional(),
  experienceYears: z.number().int().min(0).max(80).optional(),
});

export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;
  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.issues[0]?.message || "Invalid input" }, { status: 400 });
    }
    const d = parsed.data;
    const lowerEmail = d.email.toLowerCase();
    const existing = await db.user.findUnique({ where: { email: lowerEmail }, select: { id: true } });
    if (existing) return NextResponse.json({ success: false, error: "A user with this email already exists" }, { status: 409 });

    const passwordHash = hashPassword(d.password);
    const quals = d.qualifications || [];
    const specs = d.specialties || [];
    const langs = d.languages || ["English"];

    const user = await db.user.create({
      data: {
        email: lowerEmail, name: d.name, phone: d.phone, role: d.role, isActive: true, passwordHash,
        staffProfile: {
          create: {
            bio: d.bio || null, qualifications: JSON.stringify(quals), specialties: JSON.stringify(specs),
            languages: JSON.stringify(langs), photoUrl: d.photoUrl || null, resumeUrl: d.resumeUrl || null,
            department: d.department || null, employeeId: d.employeeId || null, employmentType: d.employmentType || null,
            workPhone: d.workPhone || null, workEmail: d.workEmail || null, linkedinUrl: d.linkedinUrl || null,
            experienceYears: d.experienceYears || null, joinedAt: new Date(),
          },
        },
      },
      select: { id: true, name: true, email: true, role: true },
    });

    if (d.role === "DIETITIAN" || d.role === "NUTRITIONIST") {
      const initials = d.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
      await db.dietitian.create({
        data: {
          userId: user.id, name: d.name,
          credentials: quals.length > 0 ? quals.join(", ") : "RD",
          specialty: specs.length > 0 ? specs.join(", ") : "General Nutrition",
          bio: d.bio || "", experience: d.experienceYears || 0, languages: JSON.stringify(langs),
          initials, accent: "from-emerald-500 to-teal-500", availability: "Mon-Sat",
          focus: JSON.stringify(specs), avatarUrl: d.photoUrl || null, isActive: true,
        },
      });
    }

    await db.auditLog.create({
      data: { userId: auth.userId, action: "STAFF_CREATED", entity: "User", entityId: user.id, after: JSON.stringify({ name: d.name, email: lowerEmail, role: d.role }) },
    }).catch(() => {});

    return NextResponse.json({ success: true, data: user, message: "Staff account created successfully" });
  } catch (error) {
    console.error("Failed to create staff:", error);
    return NextResponse.json({ success: false, error: "Failed to create staff account" }, { status: 500 });
  }
}
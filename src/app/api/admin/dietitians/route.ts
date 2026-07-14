import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog, serializeForAudit } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";

/**
 * GET /api/admin/dietitians — list all dietitians
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const dietitians = await db.dietitian.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
        _count: { select: { patients: true, appointments: true } },
      },
    });
    return NextResponse.json({ success: true, data: dietitians });
  } catch (error) {
    console.error("Failed to fetch dietitians:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dietitians" }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().max(32).optional(),
  credentials: z.string().max(200).optional(),
  specialty: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  experience: z.coerce.number().min(0).max(50).optional(),
  languages: z.string().max(500).optional().default("[]"),
  rating: z.coerce.number().min(0).max(5).default(5),
  initials: z.string().max(5).optional(),
  accent: z.string().max(100).optional().default("from-primary to-secondary"),
  availability: z.string().max(100).optional().default("Mon–Sat"),
  focus: z.string().max(500).optional().default("[]"),
  password: z.string().min(8).max(128),
});

/**
 * POST /api/admin/dietitians — create a new dietitian
 */
export async function POST(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid input", issues: parsed.error.issues }, { status: 400 });
    }

    const { password, ...dietitianData } = parsed.data;
    const email = parsed.data.email.toLowerCase();

    // Check if user already exists
    const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A user with this email already exists" }, { status: 409 });
    }

    const { hashPassword } = await import("@/lib/password");
    const passwordHash = hashPassword(password);

    // Create user + dietitian in a transaction
    const user = await db.user.create({
      data: {
        email,
        name: parsed.data.name,
        phone: parsed.data.phone || null,
        role: "DIETITIAN",
        isActive: true,
        passwordHash,
        dietitian: {
          create: {
            name: parsed.data.name,
            credentials: dietitianData.credentials || "",
            specialty: dietitianData.specialty || "",
            bio: dietitianData.bio || "",
            experience: dietitianData.experience || 0,
            languages: dietitianData.languages,
            rating: dietitianData.rating,
            reviewsCount: 0,
            initials: dietitianData.initials || parsed.data.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase(),
            accent: dietitianData.accent,
            availability: dietitianData.availability,
            focus: dietitianData.focus,
            isActive: true,
          },
        },
      },
      include: { dietitian: true },
    });

    await writeAuditLog({
      userId: auth.userId,
      action: "DIETITIAN_CREATED",
      entity: "Dietitian",
      entityId: user.dietitian!.id,
      after: serializeForAudit(user),
      ipAddress: getClientIp(req),
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Failed to create dietitian:", error);
    return NextResponse.json({ success: false, error: "Failed to create dietitian" }, { status: 500 });
  }
}

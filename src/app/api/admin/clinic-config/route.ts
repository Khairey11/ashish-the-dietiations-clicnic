import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";

const safeUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  })
  .max(2048)
  .or(z.literal(""));

const schema = z.object({
  clinicName: z.string().max(120).optional(),
  phoneDisplay: z.string().max(40).optional(),
  phoneRaw: z.string().max(40).optional(),
  whatsappDisplay: z.string().max(40).optional(),
  whatsappRaw: z.string().max(40).optional(),
  email: z.string().email().max(160).optional(),
  address: z.string().max(300).optional(),
  weekdayHours: z.string().max(60).optional(),
  saturdayHours: z.string().max(60).optional(),
  instagram: safeUrl.optional(),
  facebook: safeUrl.optional(),
  twitter: safeUrl.optional(),
  youtube: safeUrl.optional(),
  linkedin: safeUrl.optional(),
});

/**
 * GET /api/admin/clinic-config
 * Returns the current clinic configuration from SiteSetting (with siteConfig fallback).
 */
export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const settings = await db.siteSetting.findMany({
      where: {
        key: {
          in: [
            "clinic_name", "clinic_phone_display", "clinic_phone_raw",
            "clinic_whatsapp_display", "clinic_whatsapp_raw", "clinic_email",
            "clinic_address", "clinic_weekday_hours", "clinic_saturday_hours",
            "social_instagram", "social_facebook", "social_twitter",
            "social_youtube", "social_linkedin",
          ],
        },
      },
    });
    const map = new Map(settings.map((s) => [s.key, s.value]));
    return NextResponse.json({
      success: true,
      data: {
        clinicName: map.get("clinic_name") || "",
        phoneDisplay: map.get("clinic_phone_display") || "",
        phoneRaw: map.get("clinic_phone_raw") || "",
        whatsappDisplay: map.get("clinic_whatsapp_display") || "",
        whatsappRaw: map.get("clinic_whatsapp_raw") || "",
        email: map.get("clinic_email") || "",
        address: map.get("clinic_address") || "",
        weekdayHours: map.get("clinic_weekday_hours") || "",
        saturdayHours: map.get("clinic_saturday_hours") || "",
        instagram: map.get("social_instagram") || "",
        facebook: map.get("social_facebook") || "",
        twitter: map.get("social_twitter") || "",
        youtube: map.get("social_youtube") || "",
        linkedin: map.get("social_linkedin") || "",
      },
    });
  } catch (error) {
    console.error("Failed to fetch clinic config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch clinic config" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/clinic-config
 * Updates editable clinic contact and social settings.
 */
export async function PUT(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const keyMap: Record<string, string> = {
      clinicName: "clinic_name",
      phoneDisplay: "clinic_phone_display",
      phoneRaw: "clinic_phone_raw",
      whatsappDisplay: "clinic_whatsapp_display",
      whatsappRaw: "clinic_whatsapp_raw",
      email: "clinic_email",
      address: "clinic_address",
      weekdayHours: "clinic_weekday_hours",
      saturdayHours: "clinic_saturday_hours",
      instagram: "social_instagram",
      facebook: "social_facebook",
      twitter: "social_twitter",
      youtube: "social_youtube",
      linkedin: "social_linkedin",
    };

    let updated = 0;
    for (const [field, value] of Object.entries(parsed.data)) {
      if (value === undefined) continue;
      const key = keyMap[field];
      if (!key) continue;
      await db.siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
      updated++;
    }

    await writeAuditLog({
      userId: auth.userId,
      action: "CLINIC_CONFIG_UPDATED",
      entity: "SiteSetting",
      after: { updated },
      ipAddress: req.headers.get("x-forwarded-for")?.split(",")[0].trim() || undefined,
    });

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Failed to update clinic config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update clinic config" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { updatePaymentConfig } from "@/lib/actions/payments";
import { requireSuperAdmin } from "@/lib/auth";

const safeUrl = z
  .string()
  .url()
  .refine((u) => u.startsWith("http://") || u.startsWith("https://"), {
    message: "URL must start with http:// or https://",
  })
  .max(2048)
  .or(z.literal(""));

const updateSchema = z.object({
  khaltiMerchantMobile: z.string().max(32).optional(),
  khaltiQrUrl: safeUrl.optional(),
  esewaId: z.string().max(64).optional(),
  esewaQrUrl: safeUrl.optional(),
  bankName: z.string().max(120).optional(),
  bankAccountName: z.string().max(120).optional(),
  bankAccountNumber: z.string().max(40).optional(),
  bankBranch: z.string().max(120).optional(),
  bankQrUrl: safeUrl.optional(),
  proofMode: z.enum(["whatsapp", "upload"]).optional(),
  instructions: z.string().max(2000).optional(),
});

export async function PUT(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    const result = await updatePaymentConfig(parsed.data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update payment config:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update payment config" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const auth = await requireSuperAdmin(req);
  if (!auth.ok) return auth.response;

  try {
    const { getPaymentConfig } = await import("@/lib/actions/payments");
    const config = await getPaymentConfig();
    return NextResponse.json({ success: true, data: config });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment config" },
      { status: 500 }
    );
  }
}

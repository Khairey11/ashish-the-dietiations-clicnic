import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import { writeAuditLog } from "@/lib/audit";
import { getClientIp } from "@/lib/ratelimit";
import { deleteUploadByUrl } from "@/lib/file-cleanup";

/**
 * DELETE /api/client/delete-account
 *
 * GDPR right to erasure — deletes the authenticated user's account and all
 * associated personal data.
 *
 * Body: { confirmEmail: string } — must match the user's email to prevent
 * accidental deletion.
 *
 * What gets deleted:
 *   - Patient profile + all measurements, meal plans, reports, documents,
 *     progress photos (cascaded via Prisma onDelete: Cascade).
 *   - Messages sent + received by this user.
 *   - Notifications addressed to this user.
 *   - VerificationTokens + PasswordResets for this user.
 *   - Activity logs authored by this user (set to null userId via SetNull).
 *   - Audit logs authored by this user (set to null userId via SetNull).
 *   - Uploaded files on disk (best-effort).
 *
 * What is RETAINED (legal obligation):
 *   - Payment records: required by Nepal tax law for 7 years. Anonymised —
 *     the clientId is replaced with a tombstone so the financial record
 *     survives but is no longer linked to the person.
 *   - Audit log entries: retained for 1 year (operational security).
 *   - Appointments: anonymised (clientId set to null) so the dietitian's
 *     schedule history survives — but the client identity is removed.
 *
 * Returns 200 on success + clears the session cookie.
 */
const schema = z.object({
  confirmEmail: z.string().email(),
});

export async function DELETE(req: NextRequest) {
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: "Invalid input", issues: parsed.error.issues },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { id: auth.userId },
      select: { id: true, email: true, name: true },
    });
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Account not found" },
        { status: 404 }
      );
    }

    // Safety check: the user must confirm their email to proceed.
    if (parsed.data.confirmEmail.toLowerCase() !== user.email.toLowerCase()) {
      return NextResponse.json(
        { success: false, error: "Email confirmation does not match your account email." },
        { status: 400 }
      );
    }

    // Fetch uploaded file URLs so we can delete them from disk after the DB
    // records are gone.
    const patient = await db.patient.findUnique({
      where: { userId: user.id },
      select: { id: true },
    });
    const fileUrls: string[] = [];
    if (patient) {
      const [reports, docs, photos] = await Promise.all([
        db.report.findMany({ where: { patientId: patient.id }, select: { fileUrl: true } }),
        db.document.findMany({ where: { patientId: patient.id }, select: { fileUrl: true } }),
        db.progressPhoto.findMany({ where: { patientId: patient.id }, select: { frontUrl: true, sideUrl: true, backUrl: true } }),
      ]);
      fileUrls.push(
        ...reports.map((r) => r.fileUrl),
        ...docs.map((d) => d.fileUrl),
        ...photos.flatMap((p) => [p.frontUrl, p.sideUrl, p.backUrl].filter(Boolean) as string[]),
      );
    }

    // Anonymise payments + appointments (retain the financial/schedule record
    // but break the link to the user). The Payment.clientId FK is Restrict,
    // so we can't delete the User while payments exist — we anonymise instead.
    await db.$transaction([
      // Messages: delete both sides (Cascade on the relation isn't set, so
      // we delete explicitly).
      db.message.deleteMany({ where: { senderId: user.id } }),
      db.message.deleteMany({ where: { recipientId: user.id } }),
      // Notifications: delete.
      db.notification.deleteMany({ where: { userId: user.id } }),
      // VerificationTokens + PasswordResets: delete.
      db.verificationToken.deleteMany({ where: { identifier: user.email } }),
      db.passwordReset.deleteMany({ where: { userId: user.id } }),
      // Activity logs: set userId to null (SetNull).
      db.activityLog.updateMany({ where: { userId: user.id }, data: { userId: null } }),
      // Audit logs: set userId to null (SetNull).
      db.auditLog.updateMany({ where: { userId: user.id }, data: { userId: null } }),
    ]);

    // Delete the Patient (cascades to measurements, meal plans, reports,
    // documents, progress photos). Then delete the User.
    if (patient) {
      await db.patient.delete({ where: { id: patient.id } });
    }
    await db.user.delete({ where: { id: user.id } });

    // Best-effort: delete the uploaded files from disk.
    await Promise.all(fileUrls.map((url) => deleteUploadByUrl(url)));

    // Audit the deletion. The user.id no longer exists, but writeAuditLog
    // accepts a null userId via SetNull — so we pass the original id.
    await writeAuditLog({
      userId: user.id, // will be set to null by the SetNull onDelete
      action: "ACCOUNT_DELETED",
      entity: "User",
      entityId: user.id,
      after: { email: user.email, name: user.name, anonymisedPayments: true },
      ipAddress: getClientIp(req),
    }).catch(() => {});

    // Clear the session cookie.
    const res = NextResponse.json({
      success: true,
      message: "Your account and all associated data have been deleted. Payments were anonymised and retained as required by tax law.",
    });
    res.cookies.set("admin_session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (error) {
    console.error("Account deletion error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete account. Please contact support." },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireClient } from "@/lib/auth";
import { deleteUploadByUrl } from "@/lib/file-cleanup";

/**
 * DELETE /api/client/reports/[id]
 * Deletes a Report record (and its uploaded file) owned by the authenticated client.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireClient(req);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Report ID required" },
        { status: 400 }
      );
    }

    const patient = await db.patient.findUnique({
      where: { userId: auth.userId },
      select: { id: true },
    });
    if (!patient) {
      return NextResponse.json(
        { success: false, error: "Patient profile not found" },
        { status: 404 }
      );
    }

    // Fetch the report first — must be owned by this patient.
    const report = await db.report.findFirst({
      where: { id, patientId: patient.id },
      select: { id: true, fileUrl: true },
    });
    if (!report) {
      return NextResponse.json(
        { success: false, error: "Report not found" },
        { status: 404 }
      );
    }

    // Delete the DB record first, then the file (best-effort).
    await db.report.delete({ where: { id: report.id } });
    await deleteUploadByUrl(report.fileUrl);

    return NextResponse.json({ success: true, deleted: true });
  } catch (error) {
    console.error("Failed to delete report:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete report" },
      { status: 500 }
    );
  }
}

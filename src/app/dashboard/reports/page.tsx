"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Upload, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

type Report = {
  id: string;
  title: string;
  type: string;
  fileUrl: string;
  summary: string | null;
  uploadedAt: string;
};

export default function DashboardReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [uploading, setUploading] = React.useState(false);

  const loadReports = React.useCallback(() => {
    fetch("/api/client/reports")
      .then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/dashboard/reports"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.success) setReports(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  React.useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
    if (!input.files?.[0]) return;
    const file = input.files[0];
    setUploading(true);
    try {
      // Step 1: upload the file
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        toast.error("Upload failed", { description: uploadData.error });
        return;
      }
      // Step 2: create the Report DB record
      const createRes = await fetch("/api/client/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: file.name,
          type: "LAB",
          fileUrl: uploadData.url,
        }),
      });
      const createData = await createRes.json();
      if (createData.success) {
        toast.success("Report uploaded", { description: "Your dietitian will review it before your next appointment." });
        setReports((prev) => [createData.data, ...prev]);
        input.value = "";
      } else {
        toast.error("Failed to save report", { description: createData.error });
      }
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="mb-6"><Skeleton className="h-8 w-48" /></div>
        <Skeleton className="h-64 w-full" />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Lab Reports</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upload */}
        <div className="p-6 rounded-2xl border border-border/40 bg-card">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Upload className="w-4 h-4 text-primary" />
            Upload a report
          </h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Upload lab reports (blood panel, thyroid, HbA1c, lipid profile, etc.) so your dietitian can review them before your next consultation.
          </p>
          <form onSubmit={handleUpload} className="space-y-3">
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">PNG, JPEG, or PDF · max 5 MB</p>
            <Button type="submit" size="sm" disabled={uploading} className="bg-gradient-to-r from-primary to-secondary">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              {uploading ? "Uploading..." : "Upload report"}
            </Button>
          </form>
        </div>

        {/* Existing reports */}
        <div className="p-6 rounded-2xl border border-border/40 bg-card">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Your reports
          </h3>
          {reports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No reports uploaded yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Upload your first lab report to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((r) => (
                <div key={r.id} className="flex items-center gap-3 p-3 rounded-xl border border-border/40 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{r.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(r.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} · {r.type}
                    </p>
                  </div>
                  <a href={r.fileUrl} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" aria-label="Download report">
                      <Download className="w-4 h-4" />
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

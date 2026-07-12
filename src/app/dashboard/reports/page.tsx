"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, FileText, Upload, Download } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardReportsPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Just check auth
    fetch("/api/client/dashboard")
      .then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/dashboard/reports"); return null; }
        return r.json();
      })
      .then(() => setLoading(false))
      .catch(() => setLoading(false));
  }, [router]);

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
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const input = (e.target as HTMLFormElement).querySelector('input[type="file"]') as HTMLInputElement;
              if (!input.files?.[0]) return;
              const formData = new FormData();
              formData.append("file", input.files[0]);
              try {
                const res = await fetch("/api/upload", { method: "POST", body: formData });
                const data = await res.json();
                if (data.success) {
                  toast.success("Report uploaded", { description: "Your dietitian will review it before your next appointment." });
                  input.value = "";
                } else {
                  toast.error("Upload failed", { description: data.error });
                }
              } catch {
                toast.error("Upload failed");
              }
            }}
            className="space-y-3"
          >
            <input
              type="file"
              accept="image/png,image/jpeg,application/pdf"
              className="block w-full text-sm text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
            />
            <p className="text-[10px] text-muted-foreground">PNG, JPEG, or PDF · max 5 MB</p>
            <Button type="submit" size="sm" className="bg-gradient-to-r from-primary to-secondary">
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              Upload report
            </Button>
          </form>
        </div>

        {/* Existing reports */}
        <div className="p-6 rounded-2xl border border-border/40 bg-card">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Your reports
          </h3>
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No reports uploaded yet.</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your first lab report to get started.</p>
          </div>
        </div>
      </div>
    </>
  );
}

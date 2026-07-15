"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, LogOut, Loader2, Download, Trash2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);
  const [exporting, setExporting] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [confirmEmail, setConfirmEmail] = React.useState("");

  React.useEffect(() => {
    fetch("/api/client/dashboard")
      .then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/dashboard/settings"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.success) setData(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const signOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {}
    toast.success("Signed out");
    router.push("/");
    router.refresh();
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
        <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile */}
        <div className="p-6 rounded-2xl border border-border/40 bg-card">
          <h3 className="text-sm font-semibold mb-4">Profile</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{data?.user?.name || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{data?.user?.email || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{data?.user?.phone || "—"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Member since</span>
              <span className="font-medium">{data?.user?.createdAt ? new Date(data.user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—"}</span>
            </div>
          </div>
        </div>

        {/* Health profile */}
        {data?.patient && (
          <div className="p-6 rounded-2xl border border-border/40 bg-card">
            <h3 className="text-sm font-semibold mb-4">Health Profile</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Primary goal</span>
                <span className="font-medium">{data.patient.primaryGoal || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Condition</span>
                <span className="font-medium">{data.patient.condition || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current weight</span>
                <span className="font-medium">{data.patient.currentWeight ? `${data.patient.currentWeight} kg` : "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target weight</span>
                <span className="font-medium">{data.patient.targetWeight ? `${data.patient.targetWeight} kg` : "—"}</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              To update your health profile, contact your dietitian.
            </p>
          </div>
        )}

        {/* Data & Privacy (GDPR) */}
        <div className="p-6 rounded-2xl border border-border/40 bg-card">
          <h3 className="text-sm font-semibold mb-4">Data &amp; Privacy</h3>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            Under the GDPR and Nepal&apos;s Privacy Act, you have the right to access and delete your data.
            See our <Link href="/privacy" className="text-primary font-medium hover:underline">privacy policy</Link> for details.
          </p>

          {/* Export */}
          <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border/40 mb-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Export my data</p>
              <p className="text-xs text-muted-foreground">Download a JSON file containing all data we hold about you.</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={exporting}
              onClick={async () => {
                setExporting(true);
                try {
                  const res = await fetch("/api/client/export-data");
                  const data = await res.json();
                  if (data.success) {
                    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `my-data-${new Date().toISOString().split("T")[0]}.json`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                    toast.success("Data exported", { description: "Check your downloads folder." });
                  } else {
                    toast.error("Export failed", { description: data.error });
                  }
                } catch {
                  toast.error("Network error");
                } finally {
                  setExporting(false);
                }
              }}
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Download className="w-3.5 h-3.5 mr-1.5" />}
              Export
            </Button>
          </div>

          {/* Delete */}
          <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-rose-700 dark:text-rose-300">Delete my account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and all associated data. Payments are anonymised and retained as required by tax law.</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-rose-500/40 text-rose-700 hover:bg-rose-500/10 dark:text-rose-300"
                disabled={deleting}
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-4 pt-4 border-t border-rose-500/20 space-y-3">
                <div className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>This action is irreversible.</strong> All your health data, appointments, meal plans, messages, and uploaded reports will be permanently deleted.
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Type your email <span className="font-mono font-semibold">{data?.user?.email || "your email"}</span> to confirm:
                </p>
                <input
                  type="email"
                  value={confirmEmail}
                  onChange={(e) => setConfirmEmail(e.target.value)}
                  placeholder={data?.user?.email || "you@email.com"}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-sm"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    className="bg-rose-600 hover:bg-rose-700 text-white"
                    disabled={deleting || !confirmEmail || confirmEmail.toLowerCase() !== (data?.user?.email || "").toLowerCase()}
                    onClick={async () => {
                      setDeleting(true);
                      try {
                        const res = await fetch("/api/client/delete-account", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ confirmEmail }),
                        });
                        const d = await res.json();
                        if (d.success) {
                          toast.success("Account deleted", { description: "Redirecting you home…" });
                          setTimeout(() => { window.location.href = "/"; }, 2000);
                        } else {
                          toast.error("Deletion failed", { description: d.error });
                        }
                      } catch {
                        toast.error("Network error");
                      } finally {
                        setDeleting(false);
                      }
                    }}
                  >
                    {deleting ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 mr-1.5" />}
                    Permanently delete my account
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setShowDeleteConfirm(false); setConfirmEmail(""); }}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Account */}
        <div className="p-6 rounded-2xl border border-border/40 bg-card">
          <h3 className="text-sm font-semibold mb-4">Account</h3>
          <Button variant="outline" onClick={signOut} className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10">
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </div>
    </>
  );
}

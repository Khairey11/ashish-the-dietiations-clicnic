"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronLeft, LogOut, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export default function DashboardSettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<any>(null);

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

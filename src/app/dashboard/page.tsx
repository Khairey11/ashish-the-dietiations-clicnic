"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home, Calendar, FileText, MessageCircle, Bell, Settings, LogOut,
  CheckCircle2, Clock, Video, MapPin, User,
  Target, Wallet,
} from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Appointment = {
  id: string;
  scheduledAt: string;
  status: string;
  mode: string;
  meetingLink: string | null;
  dietitian: { name: string } | null;
  service: { title: string } | null;
  program: { duration: string; tagline: string } | null;
};

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  createdAt: string;
  isRead: boolean;
};

type DashboardData = {
  user: { id: string; name: string | null; email: string; phone: string | null; createdAt: Date } | null;
  patient: {
    id: string;
    primaryGoal: string | null;
    condition: string | null;
    startDate: Date | null;
    targetWeight: number | null;
    currentWeight: number | null;
  } | null;
  upcomingAppointments: Appointment[];
  recentNotifications: Notification[];
  activePayment: { id: string; amount: number; method: string; updatedAt: Date } | null;
};

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard", active: true },
  { icon: Calendar, label: "Appointments", href: "/dashboard/appointments" },
  { icon: FileText, label: "Reports", href: "/dashboard/reports" },
  { icon: MessageCircle, label: "Messages", href: "/dashboard/messages" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = React.useState<DashboardData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/client/dashboard")
      .then(async (r) => {
        if (r.status === 401) {
          router.push("/login?next=/dashboard");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (d?.success) setData(d.data);
        else if (d) setError(d.error || "Failed to load");
      })
      .catch(() => setError("Network error"))
      .finally(() => setLoading(false));
  }, [router]);

  const signOut = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // ignore
    }
    toast.success("Signed out", { description: "You have been logged out." });
    router.push("/");
    router.refresh();
  };

  const fmtDate = (s: string | Date) =>
    new Date(s).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  const fmtTime = (s: string | Date) =>
    new Date(s).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  const fmtRelative = (s: string | Date) => {
    const diff = Date.now() - new Date(s).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const userName = data?.user?.name || "there";
  const initials = (userName || "?")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-700 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <p className="text-xs text-muted-foreground">Welcome back</p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            {loading ? <Skeleton className="h-8 w-48" /> : `${userName} 👋`}
          </h1>
        </div>
        {data && (
          <div className="flex items-center gap-2">
            {data.upcomingAppointments.length > 0 && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-0 gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {data.upcomingAppointments.length} upcoming
              </Badge>
                )}
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Sign out
                </Button>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-6">
              {/* Profile + goal cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Profile</p>
                  </div>
                  {loading ? (
                    <Skeleton className="h-5 w-32" />
                  ) : (
                    <>
                      <p className="text-sm font-semibold">{data?.user?.email}</p>
                      <p className="text-xs text-muted-foreground">{data?.user?.phone || "No phone"}</p>
                    </>
                  )}
                </div>
                <div className="p-4 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Primary goal</p>
                  </div>
                  {loading ? (
                    <Skeleton className="h-5 w-24" />
                  ) : (
                    <p className="text-sm font-semibold">
                      {data?.patient?.primaryGoal || "Not set yet"}
                    </p>
                  )}
                </div>
                <div className="p-4 rounded-2xl border border-border/40 bg-card">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="w-4 h-4 text-primary" />
                    <p className="text-xs text-muted-foreground">Last payment</p>
                  </div>
                  {loading ? (
                    <Skeleton className="h-5 w-20" />
                  ) : data?.activePayment ? (
                    <>
                      <p className="text-sm font-semibold">
                        Rs. {data.activePayment.amount.toLocaleString("en-IN")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {data.activePayment.method} · {fmtDate(data.activePayment.updatedAt)}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No payments yet</p>
                  )}
                </div>
              </div>

              {/* Upcoming appointments */}
              <div className="p-5 rounded-2xl border border-border/40 bg-card">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-semibold">Upcoming appointments</h3>
                    <p className="text-xs text-muted-foreground">Your next consultations</p>
                  </div>
                  <Link href="/booking">
                    <Button variant="outline" size="sm" className="text-xs h-7">
                      Book new
                    </Button>
                  </Link>
                </div>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : data?.upcomingAppointments.length === 0 ? (
                  <div className="text-center py-10">
                    <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm font-semibold">No upcoming appointments</p>
                    <p className="text-xs text-muted-foreground mt-1 mb-3">
                      Book your first consultation to get started.
                    </p>
                    <Link href="/booking">
                      <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">
                        Book consultation
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {data?.upcomingAppointments.map((a) => (
                      <div
                        key={a.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/40 transition-colors"
                      >
                        <div className="text-xs font-mono font-semibold w-24 text-muted-foreground">
                          <div>{fmtDate(a.scheduledAt)}</div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {fmtTime(a.scheduledAt)}
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {(a.dietitian?.name || "?").charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold">
                            {a.service?.title || a.program?.duration || "Consultation"}
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <span>{a.dietitian?.name || "—"}</span>
                            <span className="inline-flex items-center gap-0.5">
                              {a.mode === "VIDEO" ? (
                                <>
                                  <Video className="w-3 h-3" /> Video
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-3 h-3" /> In-clinic
                                </>
                              )}
                            </span>
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-md bg-muted text-muted-foreground">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Notifications */}
              <div className="p-5 rounded-2xl border border-border/40 bg-card">
                <h3 className="text-sm font-semibold mb-4">Recent notifications</h3>
                {loading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : data?.recentNotifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No notifications yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {data?.recentNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-xl",
                          !n.isRead && "bg-primary/5"
                        )}
                      >
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Bell className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold">{n.title}</p>
                          {n.body && (
                            <p className="text-[11px] text-muted-foreground mt-0.5">{n.body}</p>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground flex-shrink-0">
                          {fmtRelative(n.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
    </>
  );
}

"use client";

import * as React from "react";
import { CalendarDays, Clock, Video, MapPin, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
};

export default function DashboardAppointmentsPage() {
  const router = useRouter();
  const [appointments, setAppointments] = React.useState<Appointment[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/client/dashboard")
      .then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/dashboard/appointments"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.success) setAppointments(d.data.upcomingAppointments || []);
      })
      .catch(() => toast.error("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, [router]);

  const fmtDate = (s: string) => new Date(s).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const fmtTime = (s: string) => new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">My Appointments</h1>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-border/40 bg-card">
          <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold">No upcoming appointments</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">Book a consultation to get started.</p>
          <Link href="/booking">
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">Book consultation</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a.id} className="p-4 rounded-2xl border border-border/40 bg-card flex items-center gap-4">
              <div className="text-center min-w-[80px]">
                <p className="text-xs text-muted-foreground">{fmtDate(a.scheduledAt).split(",")[0]}</p>
                <p className="text-2xl font-bold">{new Date(a.scheduledAt).getDate()}</p>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />{fmtTime(a.scheduledAt)}
                </p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{a.service?.title || "Consultation"}</p>
                <p className="text-xs text-muted-foreground">{a.dietitian?.name || "—"}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {a.mode === "VIDEO" ? <><Video className="w-3 h-3" /> Video call</> : <><MapPin className="w-3 h-3" /> In-clinic</>}
                </p>
              </div>
              <Badge variant="outline" className="text-[10px] uppercase">{a.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

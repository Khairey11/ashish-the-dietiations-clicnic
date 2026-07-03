"use client";

import * as React from "react";
import Link from "next/link";
import {
  CalendarDays, ChevronLeft, Loader2, Video, MapPin, Clock,
} from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type AppointmentRow = {
  id: string;
  scheduledAt: string;
  status: "PENDING" | "CONFIRMED" | "SCHEDULED" | "COMPLETED" | "CANCELLED" | "NO_SHOW" | "RESCHEDULED";
  mode: string;
  meetingLink: string | null;
  notes: string | null;
  client: { id: string; name: string | null; email: string; phone: string | null } | null;
  dietitian: { id: string; name: string } | null;
  service: { id: string; title: string; slug: string } | null;
  program: { id: string; duration: string; tagline: string } | null;
};

const statusFilters = ["ALL", "CONFIRMED", "SCHEDULED", "COMPLETED", "CANCELLED", "NO_SHOW"] as const;
type StatusFilter = (typeof statusFilters)[number];

const statusOptions: Array<{
  value: AppointmentRow["status"];
  label: string;
}> = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No-show" },
  { value: "RESCHEDULED", label: "Rescheduled" },
];

export default function AdminAppointmentsPage() {
  const [appointments, setAppointments] = React.useState<AppointmentRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<StatusFilter>("CONFIRMED");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = filter === "ALL" ? "" : `?status=${filter}`;
      const res = await fetch(`/api/admin/appointments${qs}`);
      const data = await res.json();
      if (data.success) setAppointments(data.data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  React.useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: AppointmentRow["status"]) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Appointment updated", {
          description: `Marked as ${status.toLowerCase().replace("_", "-")}.`,
        });
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status } : a))
        );
      } else {
        toast.error("Update failed", { description: data.error });
      }
    } catch {
      toast.error("Update failed", { description: "Network error" });
    } finally {
      setUpdatingId(null);
    }
  };

  const fmtDateTime = (s: string) => {
    const d = new Date(s);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }),
    };
  };

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      <main id="main" className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold">Appointments</h1>
                  <Badge className="bg-primary/15 text-primary border-0">
                    {filter === "ALL" ? "All" : filter.replace("_", "-")}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  View and manage client consultations across all dietitians.
                </p>
              </div>
            </div>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {statusFilters.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap",
                  filter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border border-border/60 hover:bg-muted/60"
                )}
              >
                {s === "ALL" && <CalendarDays className="w-3 h-3 inline mr-1" />}
                {s.replace("_", "-")}
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-16 px-4">
                <CalendarDays className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-semibold">No {filter === "ALL" ? "" : filter.toLowerCase().replace("_", "-")} appointments</p>
                <p className="text-xs text-muted-foreground mt-1">
                  New bookings from the website will appear here automatically.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Dietitian</TableHead>
                      <TableHead className="text-xs">When</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Service / Program</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Mode</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((a) => {
                      const dt = fmtDateTime(a.scheduledAt);
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="text-xs">
                            <div className="font-semibold">{a.client?.name || "—"}</div>
                            <div className="text-muted-foreground">{a.client?.email}</div>
                          </TableCell>
                          <TableCell className="text-xs hidden sm:table-cell">
                            {a.dietitian?.name || "—"}
                          </TableCell>
                          <TableCell className="text-xs">
                            <div className="font-medium">{dt.date}</div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {dt.time}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs hidden md:table-cell">
                            {a.service && <div className="font-medium">{a.service.title}</div>}
                            {a.program && (
                              <div className="text-muted-foreground">{a.program.duration}</div>
                            )}
                            {!a.service && !a.program && "—"}
                          </TableCell>
                          <TableCell className="text-xs hidden lg:table-cell">
                            {a.mode === "VIDEO" ? (
                              <span className="inline-flex items-center gap-1 text-violet-600 dark:text-violet-400">
                                <Video className="w-3 h-3" /> Video
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400">
                                <MapPin className="w-3 h-3" /> In-clinic
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <select
                              value={a.status}
                              onChange={(e) => updateStatus(a.id, e.target.value as AppointmentRow["status"])}
                              disabled={updatingId === a.id}
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md border-0 cursor-pointer disabled:opacity-50",
                                a.status === "CONFIRMED" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                                a.status === "SCHEDULED" && "bg-sky-500/15 text-sky-600 dark:text-sky-400",
                                a.status === "PENDING" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                                a.status === "COMPLETED" && "bg-primary/15 text-primary",
                                a.status === "CANCELLED" && "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                                a.status === "NO_SHOW" && "bg-orange-500/15 text-orange-600 dark:text-orange-400",
                                a.status === "RESCHEDULED" && "bg-violet-500/15 text-violet-600 dark:text-violet-400"
                              )}
                            >
                              {statusOptions.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

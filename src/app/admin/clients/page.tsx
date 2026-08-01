"use client";

import * as React from "react";
import Link from "next/link";
import {
  Users, ChevronLeft, Search, Target, CalendarDays,
  Wallet, ArrowUpRight, X, CheckCircle2, Ban, Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type ClientRow = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  patient: {
    id: string;
    primaryGoal: string | null;
    condition: string | null;
    currentWeight: number | null;
    targetWeight: number | null;
    startDate: Date | null;
  } | null;
  _count: { appointments: number; payments: number };
};

type ClientDetail = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  patient: {
    id: string;
    primaryGoal: string | null;
    medicalHistory: string | null;
    allergies: string | null;
    medications: string | null;
    condition: string | null;
    currentWeight: number | null;
    targetWeight: number | null;
    height: number | null;
    dateOfBirth: Date | null;
    gender: string | null;
    address: string | null;
    emergencyPhone: string | null;
    startDate: Date | null;
  } | null;
  appointments: Array<{
    id: string;
    scheduledAt: string;
    status: string;
    mode: string;
    dietitian: { name: string } | null;
    service: { title: string } | null;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    currency: string;
    method: string;
    status: string;
    createdAt: string;
    program: { duration: string } | null;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    body: string | null;
    isRead: boolean;
    createdAt: string;
  }>;
  _count: { appointments: number; payments: number; notifications: number };
};

export default function AdminClientsPage() {
  const [clients, setClients] = React.useState<ClientRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [selected, setSelected] = React.useState<ClientDetail | null>(null);
  const [detailLoading, setDetailLoading] = React.useState(false);
  const [statusFilter, setStatusFilter] = React.useState<"all" | "pending" | "active" | "suspended">("all");
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);
  const [pendingCount, setPendingCount] = React.useState(0);

  // Debounce search
  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/admin/clients?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setClients(data.data);
        setPendingCount(data.pendingCount ?? 0);
      }
    } catch {
      toast.error("Failed to load clients");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  const updateClientStatus = async (clientId: string, action: "approve" | "reject" | "suspend" | "reactivate") => {
    setActionLoading(clientId + action);
    try {
      const res = await fetch(`/api/admin/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message || `Client ${action}d`);
        if (action === "reject") {
          setClients((prev) => prev.filter((c) => c.id !== clientId));
        } else {
          setClients((prev) => prev.map((c) => c.id === clientId ? { ...c, isActive: action === "approve" || action === "reactivate" } : c));
        }
        load();
      } else {
        toast.error("Action failed", { description: data.error });
      }
    } catch {
      toast.error("Action failed");
    } finally {
      setActionLoading(null);
    }
  };

  React.useEffect(() => {
    load();
  }, [load]);

  const statusTabs = [
    { key: "all" as const, label: "All", count: null },
    { key: "pending" as const, label: "Pending", count: pendingCount },
    { key: "active" as const, label: "Active", count: null },
    { key: "suspended" as const, label: "Suspended", count: null },
  ];

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/admin/clients/${id}`);
      const data = await res.json();
      if (data.success) setSelected(data.data);
      else toast.error("Failed to load client", { description: data.error });
    } catch {
      toast.error("Failed to load client");
    } finally {
      setDetailLoading(false);
    }
  };

  const fmtDate = (s: string | Date) =>
    new Date(s).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const fmtNPR = (n: number) => `Rs. ${n.toLocaleString("en-IN")}`;

  return (
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
                  <h1 className="text-2xl sm:text-3xl font-bold">Clients</h1>
                  <Badge className="bg-primary/15 text-primary border-0">
                    {clients.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Search, view profiles, and manage client records.
                </p>
              </div>
            </div>
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 mb-4 p-1 rounded-xl border border-border/40 bg-card w-fit">
            {statusTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5",
                  statusFilter === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                {tab.label}
                {tab.count !== null && tab.count > 0 && (
                  <span className={cn(
                    "text-[9px] font-bold rounded-full px-1.5 py-0.5",
                    statusFilter === tab.key ? "bg-white/20" : "bg-amber-500/15 text-amber-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative max-w-md mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="pl-9 h-11"
              aria-label="Search clients"
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl border border-border/40 bg-card overflow-hidden">
            {loading ? (
              <div className="p-6 space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-16 px-4">
                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm font-semibold">No clients found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {debouncedSearch
                    ? "Try a different search term."
                    : "New clients from bookings will appear here."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Client</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Goal</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Condition</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Joined</TableHead>
                      <TableHead className="text-xs text-center">Appts</TableHead>
                      <TableHead className="text-xs text-center">Payments</TableHead>
                      <TableHead className="text-xs text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell className="text-xs">
                          <div className="font-semibold">{c.name || "—"}</div>
                          <div className="text-muted-foreground">{c.email}</div>
                          {c.phone && (
                            <div className="text-muted-foreground">{c.phone}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-xs hidden sm:table-cell max-w-[200px] truncate">
                          {c.patient?.primaryGoal || "—"}
                        </TableCell>
                        <TableCell className="text-xs hidden md:table-cell">
                          {c.patient?.condition ? (
                            <Badge variant="outline" className="text-[10px]">
                              {c.patient.condition}
                            </Badge>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {c.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400">
                              <Ban className="w-3 h-3" />Pending
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs hidden lg:table-cell text-muted-foreground">
                          {fmtDate(c.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs text-center font-semibold">
                          {c._count.appointments}
                        </TableCell>
                        <TableCell className="text-xs text-center font-semibold">
                          {c._count.payments}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {!c.isActive && (
                              <>
                                <Button size="sm" variant="ghost" disabled={actionLoading === c.id + "approve"} onClick={() => updateClientStatus(c.id, "approve")} className="h-7 px-2 text-[10px] text-emerald-600 hover:bg-emerald-500/10" title="Approve">
                                  {actionLoading === c.id + "approve" ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                  <span className="hidden xl:inline ml-0.5">Approve</span>
                                </Button>
                                <Button size="sm" variant="ghost" disabled={actionLoading === c.id + "reject"} onClick={() => { if (confirm(`Reject and delete ${c.name || c.email}?`)) updateClientStatus(c.id, "reject"); }} className="h-7 px-2 text-[10px] text-rose-600 hover:bg-rose-500/10" title="Reject">
                                  <Trash2 className="w-3.5 h-3.5" /><span className="hidden xl:inline ml-0.5">Reject</span>
                                </Button>
                              </>
                            )}
                            {c.isActive && (
                              <Button size="sm" variant="ghost" disabled={actionLoading === c.id + "suspend"} onClick={() => updateClientStatus(c.id, "suspend")} className="h-7 px-2 text-[10px] text-amber-600 hover:bg-amber-500/10" title="Suspend">
                                {actionLoading === c.id + "suspend" ? <span className="w-3 h-3 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
                                <span className="hidden xl:inline ml-0.5">Suspend</span>
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => openDetail(c.id)} className="h-7 text-xs">View<ArrowUpRight className="w-3 h-3 ml-1" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

      {/* Detail drawer */}
      {selected && (
        <ClientDetailDrawer
          client={selected}
          loading={detailLoading}
          onClose={() => setSelected(null)}
          fmtDate={fmtDate}
          fmtNPR={fmtNPR}
        />
      )}
    </div>
  );
}

function ClientDetailDrawer({
  client,
  loading,
  onClose,
  fmtDate,
  fmtNPR,
}: {
  client: ClientDetail | null;
  loading: boolean;
  onClose: () => void;
  fmtDate: (s: string | Date) => string;
  fmtNPR: (n: number) => string;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-card border-l border-border/40 overflow-y-auto">
        {loading || !client ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-white font-bold">
                  {(client.name || "?").charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold">{client.name}</h2>
                  <p className="text-sm text-muted-foreground">{client.email}</p>
                  <p className="text-xs text-muted-foreground">{client.phone || "No phone"}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patient profile */}
            {client.patient && (
              <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border/40">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Health Profile
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-muted-foreground">Primary goal</p>
                    <p className="font-medium">{client.patient.primaryGoal || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Condition</p>
                    <p className="font-medium">{client.patient.condition || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Current weight</p>
                    <p className="font-medium">
                      {client.patient.currentWeight ? `${client.patient.currentWeight} kg` : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Target weight</p>
                    <p className="font-medium">
                      {client.patient.targetWeight ? `${client.patient.targetWeight} kg` : "—"}
                    </p>
                  </div>
                  {client.patient.medicalHistory && (
                    <div className="sm:col-span-2">
                      <p className="text-muted-foreground">Medical history</p>
                      <p className="font-medium">{client.patient.medicalHistory}</p>
                    </div>
                  )}
                  {client.patient.allergies && (
                    <div>
                      <p className="text-muted-foreground">Allergies</p>
                      <p className="font-medium">{client.patient.allergies}</p>
                    </div>
                  )}
                  {client.patient.medications && (
                    <div>
                      <p className="text-muted-foreground">Medications</p>
                      <p className="font-medium">{client.patient.medications}</p>
                    </div>
                  )}
                  {client.patient.emergencyPhone && (
                    <div>
                      <p className="text-muted-foreground">Emergency phone</p>
                      <p className="font-medium">{client.patient.emergencyPhone}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl border border-border/40 bg-card text-center">
                <CalendarDays className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{client._count.appointments}</p>
                <p className="text-[10px] text-muted-foreground">Appointments</p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 bg-card text-center">
                <Wallet className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{client._count.payments}</p>
                <p className="text-[10px] text-muted-foreground">Payments</p>
              </div>
              <div className="p-3 rounded-xl border border-border/40 bg-card text-center">
                <Users className="w-4 h-4 text-primary mx-auto mb-1" />
                <p className="text-lg font-bold">{client._count.notifications}</p>
                <p className="text-[10px] text-muted-foreground">Notifications</p>
              </div>
            </div>

            {/* Recent appointments */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Recent appointments</h3>
              {client.appointments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">No appointments yet.</p>
              ) : (
                <div className="space-y-2">
                  {client.appointments.slice(0, 5).map((a) => (
                    <div key={a.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-xs">
                      <div className="font-mono w-24 text-muted-foreground">{fmtDate(a.scheduledAt)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{a.service?.title || "Consultation"}</p>
                        <p className="text-muted-foreground">{a.dietitian?.name || "—"}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-muted">
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent payments */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3">Recent payments</h3>
              {client.payments.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4">No payments yet.</p>
              ) : (
                <div className="space-y-2">
                  {client.payments.slice(0, 5).map((p) => (
                    <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30 text-xs">
                      <div className="font-mono w-24 text-muted-foreground">{fmtDate(p.createdAt)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{fmtNPR(p.amount)}</p>
                        <p className="text-muted-foreground">
                          {p.method} · {p.program?.duration || "—"}
                        </p>
                      </div>
                      <span className={cn(
                        "text-[10px] font-bold uppercase px-2 py-0.5 rounded",
                        p.status === "PAID" && "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
                        p.status === "PENDING" && "bg-amber-500/15 text-amber-600 dark:text-amber-400",
                        p.status === "FAILED" && "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                      )}>
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, ChevronLeft, Search, MoreVertical, UserCog, Loader2, Upload, Shield, Eye, EyeOff, Key, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { ROLE_META, STAFF_ROLES } from "@/lib/permissions";

type StaffMember = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  avatarUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  staffProfile: {
    id: string;
    bio: string | null;
    photoUrl: string | null;
    department: string | null;
    employmentType: string | null;
    employeeId: string | null;
    qualifications: string | null;
    specialties: string | null;
    isVerified: boolean;
    joinedAt: string | null;
  } | null;
  dietitian: { id: string; specialty: string; rating: number; _count: { patients: number } } | null;
  _count: { blogPosts: number; auditLogs: number };
};

export default function AdminStaffPage() {
  const [staff, setStaff] = React.useState<StaffMember[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [showCreate, setShowCreate] = React.useState(false);
  const [actionMenu, setActionMenu] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.success) setStaff(data.data);
    } catch { toast.error("Failed to load staff"); }
    finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const filtered = staff.filter((s) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (s.name || "").toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || (s.role || "").toLowerCase().includes(q);
  });

  const toggleActive = async (id: string) => {
    setActionMenu(null);
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "toggleActive" }) });
      const d = await res.json();
      if (d.success) { toast.success(d.message); load(); }
      else toast.error(d.error);
    } catch { toast.error("Failed"); }
  };

  const deactivate = async (id: string) => {
    setActionMenu(null);
    if (!confirm("Deactivate this staff account? They will no longer be able to log in.")) return;
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (d.success) { toast.success(d.message); load(); }
      else toast.error(d.error);
    } catch { toast.error("Failed"); }
  };

  const resetPassword = async (id: string) => {
    setActionMenu(null);
    const password = prompt("Enter new temporary password (min 8 characters):");
    if (!password || password.length < 8) { if (password) toast.error("Password must be at least 8 characters"); return; }
    try {
      const res = await fetch(`/api/admin/staff/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resetPassword", password }) });
      const d = await res.json();
      if (d.success) toast.success(d.message);
      else toast.error(d.error);
    } catch { toast.error("Failed"); }
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin"><Button variant="ghost" size="sm"><ChevronLeft className="w-4 h-4 mr-1" /> Back</Button></Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold">Staff</h1>
              <Badge className="bg-primary/15 text-primary border-0">{staff.length}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Create staff accounts, manage roles & permissions.</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setShowCreate(!showCreate)} className="bg-secondary hover:bg-secondary/90">
          <Plus className="w-4 h-4 mr-1" /> Add staff
        </Button>
      </div>

      {showCreate && (
        <div className="mb-6 p-5 rounded-2xl border border-border/40 bg-card">
          <CreateStaffForm onCreated={() => { setShowCreate(false); load(); }} onCancel={() => setShowCreate(false)} />
        </div>
      )}

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search staff..." className="pl-9 h-11" />
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16"><UserCog className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" /><p className="text-sm font-semibold">No staff found</p></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const meta = ROLE_META[s.role] || ROLE_META.CLIENT;
            const photo = s.staffProfile?.photoUrl || s.avatarUrl;
            return (
              <div key={s.id} className="p-4 rounded-2xl border border-border/40 bg-card relative">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {photo ? <Image src={photo} alt={s.name || ""} width={56} height={56} className="w-full h-full object-cover" /> : <span className="text-lg font-bold text-secondary">{(s.name || "?").charAt(0)}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                      {s.staffProfile?.isVerified && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                    <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold", meta.color)}>{meta.label}</span>
                  </div>
                  <div className="relative">
                    <button onClick={() => setActionMenu(actionMenu === s.id ? null : s.id)} className="p-1.5 rounded-lg hover:bg-muted">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {actionMenu === s.id && (
                      <div className="absolute right-0 top-8 z-10 w-44 p-1 rounded-xl border border-border/60 bg-popover shadow-premium">
                        <button onClick={() => toggleActive(s.id)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs hover:bg-muted text-left">
                          {s.isActive ? <><EyeOff className="w-3.5 h-3.5" /> Deactivate</> : <><Eye className="w-3.5 h-3.5" /> Activate</>}
                        </button>
                        <button onClick={() => resetPassword(s.id)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs hover:bg-muted text-left">
                          <Key className="w-3.5 h-3.5" /> Reset password
                        </button>
                        <button onClick={() => deactivate(s.id)} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs hover:bg-rose-500/10 text-rose-600 text-left">
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {s.staffProfile?.bio && <p className="mt-3 text-xs text-muted-foreground line-clamp-2">{s.staffProfile.bio}</p>}

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {s.staffProfile?.department && <Badge variant="outline" className="text-[10px]">{s.staffProfile.department}</Badge>}
                  {s.staffProfile?.employmentType && <Badge variant="outline" className="text-[10px]">{s.staffProfile.employmentType.replace("_", " ")}</Badge>}
                  <span className={cn("text-[10px] font-bold flex items-center gap-1", s.isActive ? "text-emerald-600" : "text-muted-foreground")}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", s.isActive ? "bg-emerald-500" : "bg-muted-foreground/40")} />
                    {s.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {s.dietitian && (
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    {s.dietitian._count.patients} patients · Rating {s.dietitian.rating}/5
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {actionMenu && <div className="fixed inset-0 z-0" onClick={() => setActionMenu(null)} />}
    </div>
  );
}

function CreateStaffForm({ onCreated, onCancel }: { onCreated: () => void; onCancel: () => void }) {
  const [form, setForm] = React.useState({
    name: "", email: "", phone: "", password: "", role: "DIETITIAN",
    bio: "", qualifications: "", specialties: "", department: "Clinical", employmentType: "FULL_TIME",
  });
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const d = await res.json();
      if (d.success) setPhotoUrl(d.data.url);
      else toast.error(d.error);
    } catch { toast.error("Upload failed"); }
    finally { setUploading(false); }
  };

  const save = async () => {
    setSaving(true);
    try {
      const qualifications = form.qualifications.split(",").map((s) => s.trim()).filter(Boolean);
      const specialties = form.specialties.split(",").map((s) => s.trim()).filter(Boolean);
      const res = await fetch("/api/admin/staff", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, qualifications, specialties, photoUrl: photoUrl || undefined }),
      });
      const d = await res.json();
      if (d.success) { toast.success(d.message); onCreated(); }
      else toast.error(d.error);
    } catch { toast.error("Failed to create"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold">Create Staff Account</h3>

      {/* Photo upload */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border/60">
          {photoUrl ? <Image src={photoUrl} alt="" width={80} height={80} className="w-full h-full object-cover" /> : <UserCog className="w-8 h-8 text-muted-foreground/40" />}
        </div>
        <div>
          <Label className="text-xs">Profile Photo</Label>
          <Label className="mt-1 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border/60 cursor-pointer hover:bg-muted text-xs">
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            {uploading ? "Uploading..." : "Upload photo"}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); }} />
          </Label>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div><Label className="text-xs">Name *</Label><Input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Dr. Rohan Thapa" className="h-9 mt-1" /></div>
        <div><Label className="text-xs">Email *</Label><Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="staff@clinic.com" className="h-9 mt-1" /></div>
        <div><Label className="text-xs">Phone</Label><Input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+977 98..." className="h-9 mt-1" /></div>
        <div><Label className="text-xs">Password *</Label><Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="min 8 chars" className="h-9 mt-1" /></div>
        <div>
          <Label className="text-xs">Role *</Label>
          <select value={form.role} onChange={(e) => update("role", e.target.value)} className="w-full h-9 mt-1 rounded-lg border border-border/60 bg-card px-2 text-sm">
            {STAFF_ROLES.filter((r) => r !== "SUPER_ADMIN").map((r) => <option key={r} value={r}>{ROLE_META[r]?.label || r}</option>)}
          </select>
        </div>
        <div><Label className="text-xs">Department</Label><Input value={form.department} onChange={(e) => update("department", e.target.value)} placeholder="Clinical / Content / Finance" className="h-9 mt-1" /></div>
        <div>
          <Label className="text-xs">Employment Type</Label>
          <select value={form.employmentType} onChange={(e) => update("employmentType", e.target.value)} className="w-full h-9 mt-1 rounded-lg border border-border/60 bg-card px-2 text-sm">
            <option value="FULL_TIME">Full Time</option>
            <option value="PART_TIME">Part Time</option>
            <option value="CONTRACT">Contract</option>
            <option value="CONSULTANT">Consultant</option>
          </select>
        </div>
        <div><Label className="text-xs">Qualifications (comma-separated)</Label><Input value={form.qualifications} onChange={(e) => update("qualifications", e.target.value)} placeholder="RD, PhD, MSc" className="h-9 mt-1" /></div>
        <div><Label className="text-xs">Specialties (comma-separated)</Label><Input value={form.specialties} onChange={(e) => update("specialties", e.target.value)} placeholder="Diabetes, PCOS, Sports" className="h-9 mt-1" /></div>
      </div>
      <div><Label className="text-xs">Bio</Label><Textarea value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="Professional bio..." rows={2} className="resize-none mt-1" /></div>

      <div className="flex gap-2">
        <Button size="sm" onClick={save} disabled={saving || !form.name || !form.email || !form.password} className="bg-secondary hover:bg-secondary/90">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Shield className="w-4 h-4 mr-1" /> Create account</>}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
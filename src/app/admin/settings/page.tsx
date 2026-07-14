"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  CreditCard, QrCode, Save, Upload, CheckCircle2, Banknote, Smartphone, MessageCircle, Phone, ShieldCheck, } from "lucide-react";
import { Navigation } from "@/components/site/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { siteConfig } from "@/lib/site-config";

type PaymentConfig = {
  khalti: { enabled: boolean; merchantMobile: string; qrUrl: string | null; apiKeyConfigured: boolean };
  esewa: { enabled: boolean; id: string; qrUrl: string | null; merchantCodeConfigured: boolean };
  bank: { enabled: boolean; bankName: string; accountName: string; accountNumber: string; branch: string; qrUrl: string | null };
  proofMode: "whatsapp" | "upload";
  instructions: string;
  whatsappNumber: string;
  whatsappRaw: string;
};

export default function AdminSettingsPage() {
  const [config, setConfig] = React.useState<PaymentConfig | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Editable form state
  const [form, setForm] = React.useState<any>({});
  const [qrPreviews, setQrPreviews] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    fetch("/api/payments/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setConfig(d.data);
          setForm({
            khaltiMerchantMobile: d.data.khalti.merchantMobile || "",
            khaltiQrUrl: d.data.khalti.qrUrl || "",
            esewaId: d.data.esewa.id || "",
            esewaQrUrl: d.data.esewa.qrUrl || "",
            bankName: d.data.bank.bankName || "",
            bankAccountName: d.data.bank.accountName || "",
            bankAccountNumber: d.data.bank.accountNumber || "",
            bankBranch: d.data.bank.branch || "",
            bankQrUrl: d.data.bank.qrUrl || "",
            proofMode: d.data.proofMode || "whatsapp",
            instructions: d.data.instructions || "",
          });
          setQrPreviews({
            khalti: d.data.khalti.qrUrl || "",
            esewa: d.data.esewa.qrUrl || "",
            bank: d.data.bank.qrUrl || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleQrUpload = (provider: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", { description: "Max 2MB for QR images." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setQrPreviews((p) => ({ ...p, [provider]: dataUrl }));
      setForm((f: any) => ({ ...f, [`${provider}QrUrl`]: dataUrl }));
      toast.success("QR uploaded", { description: "Click Save to persist." });
    };
    reader.readAsDataURL(file);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/payment-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Settings saved", {
          description: `${data.updated} fields updated.`,
        });
      } else {
        toast.error("Save failed", { description: data.error });
      }
    } catch {
      toast.error("Save failed", { description: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-muted/30">
        <Navigation />
        <main className="flex-1 pt-20 container mx-auto px-4 sm:px-6 py-8">
          <div className="h-8 w-64 bg-muted rounded animate-pulse mb-6" />
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-muted/30">
      <Navigation />
      <main className="flex-1 pt-20">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
                <Badge className="bg-primary/15 text-primary border-0">Super Admin</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Manage payment methods, QR codes, and clinic contact details.
              </p>
            </div>
            <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-primary to-secondary">
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save changes
                </>
              )}
            </Button>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* ============ Payment methods ============ */}
            <div className="lg:col-span-2 space-y-6">
              <SectionCard
                icon={CreditCard}
                title="Payment methods"
                description="Configure how clients pay for programs. API credentials are set via env vars; QR codes are uploaded here for manual verification."
              >
                {/* Khalti */}
                <ProviderCard
                  name="Khalti"
                  color="bg-purple-500"
                  icon={Smartphone}
                  live={!!config?.khalti.apiKeyConfigured}
                >
                  <Field label="Merchant mobile" value={form.khaltiMerchantMobile}
                    onChange={(v) => setForm((f: any) => ({ ...f, khaltiMerchantMobile: v }))}
                    placeholder="9800000000" />
                  <EnvRow label="KHALTI_API_KEY" configured={!!config?.khalti.apiKeyConfigured} />
                  <EnvRow label="KHALTI_SECRET" configured={!!config?.khalti.apiKeyConfigured} />
                  <QrUploader
                    label="Khalti QR code"
                    preview={qrPreviews.khalti}
                    onUpload={(e) => handleQrUpload("khalti", e)}
                    onClear={() => {
                      setQrPreviews((p) => ({ ...p, khalti: "" }));
                      setForm((f: any) => ({ ...f, khaltiQrUrl: "" }));
                    }}
                  />
                </ProviderCard>

                {/* eSewa */}
                <ProviderCard
                  name="eSewa"
                  color="bg-green-500"
                  icon={Smartphone}
                  live={!!config?.esewa.merchantCodeConfigured}
                >
                  <Field label="eSewa ID" value={form.esewaId}
                    onChange={(v) => setForm((f: any) => ({ ...f, esewaId: v }))}
                    placeholder="thedietitiansclinic" />
                  <EnvRow label="ESEWA_MERCHANT_CODE" configured={!!config?.esewa.merchantCodeConfigured} />
                  <EnvRow label="ESEWA_SECRET" configured={!!config?.esewa.merchantCodeConfigured} />
                  <QrUploader
                    label="eSewa QR code"
                    preview={qrPreviews.esewa}
                    onUpload={(e) => handleQrUpload("esewa", e)}
                    onClear={() => {
                      setQrPreviews((p) => ({ ...p, esewa: "" }));
                      setForm((f: any) => ({ ...f, esewaQrUrl: "" }));
                    }}
                  />
                </ProviderCard>

                {/* Bank */}
                <ProviderCard
                  name="Bank Transfer"
                  color="bg-sky-500"
                  icon={Banknote}
                  live={false}
                  hideLiveBadge
                >
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Bank name" value={form.bankName}
                      onChange={(v) => setForm((f: any) => ({ ...f, bankName: v }))} />
                    <Field label="Account name" value={form.bankAccountName}
                      onChange={(v) => setForm((f: any) => ({ ...f, bankAccountName: v }))} />
                    <Field label="Account number" value={form.bankAccountNumber}
                      onChange={(v) => setForm((f: any) => ({ ...f, bankAccountNumber: v }))} />
                    <Field label="Branch" value={form.bankBranch}
                      onChange={(v) => setForm((f: any) => ({ ...f, bankBranch: v }))} />
                  </div>
                  <QrUploader
                    label="Bank QR code"
                    preview={qrPreviews.bank}
                    onUpload={(e) => handleQrUpload("bank", e)}
                    onClear={() => {
                      setQrPreviews((p) => ({ ...p, bank: "" }));
                      setForm((f: any) => ({ ...f, bankQrUrl: "" }));
                    }}
                  />
                </ProviderCard>
              </SectionCard>

              {/* Proof mode + instructions */}
              <SectionCard
                icon={MessageCircle}
                title="Payment proof & verification"
                description="Choose how clients submit their payment screenshot."
              >
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setForm((f: any) => ({ ...f, proofMode: "whatsapp" }))}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      form.proofMode === "whatsapp"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <MessageCircle className="w-5 h-5 text-[#25D366] mb-2" />
                    <p className="text-sm font-semibold">WhatsApp proof</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Client sends screenshot via WhatsApp with prefilled booking details.
                    </p>
                  </button>
                  <button
                    onClick={() => setForm((f: any) => ({ ...f, proofMode: "upload" }))}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      form.proofMode === "upload"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/40"
                    )}
                  >
                    <Upload className="w-5 h-5 text-primary mb-2" />
                    <p className="text-sm font-semibold">Upload proof</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Client uploads screenshot during booking; admin verifies in portal.
                    </p>
                  </button>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Instructions shown to client</Label>
                  <Textarea
                    value={form.instructions}
                    onChange={(e) => setForm((f: any) => ({ ...f, instructions: e.target.value }))}
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </SectionCard>
            </div>

            {/* ============ Clinic contact & social (editable) ============ */}
            <ClinicConfigSection />
            <ChangePasswordSection />
          </div>
        </div>
      </main>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border/60 bg-card p-6"
    >
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.div>
  );
}

function ProviderCard({
  name,
  color,
  icon: Icon,
  live,
  hideLiveBadge,
  children,
}: {
  name: string;
  color: string;
  icon: any;
  live: boolean;
  hideLiveBadge?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white", color)}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">{name}</p>
            <p className="text-[10px] text-muted-foreground">
              {live ? "Live API connected" : "Manual QR mode"}
            </p>
          </div>
        </div>
        {!hideLiveBadge && (
          live ? (
            <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              LIVE
            </Badge>
          ) : (
            <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400">
              QR mode
            </Badge>
          )
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-10" />
    </div>
  );
}

function EnvRow({ label, configured }: { label: string; configured: boolean }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40">
      <code className="text-xs font-mono">{label}</code>
      {configured ? (
        <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-0 text-[10px]">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Set
        </Badge>
      ) : (
        <Badge variant="outline" className="text-[10px] text-muted-foreground">Not set</Badge>
      )}
    </div>
  );
}

function QrUploader({
  label,
  preview,
  onUpload,
  onClear,
}: {
  label: string;
  preview: string;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {preview ? (
        <div className="flex items-center gap-3">
          <div className="w-20 h-20 rounded-xl bg-white p-1 border border-border/60 flex-shrink-0">
            <img src={preview} alt="QR preview" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              QR uploaded
            </p>
            <div className="flex gap-2 mt-2">
              <label className="cursor-pointer">
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                <span className="text-xs px-2.5 py-1 rounded-md bg-muted hover:bg-muted/70 font-medium inline-block">
                  Replace
                </span>
              </label>
              <button
                onClick={onClear}
                className="text-xs px-2.5 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label className="block cursor-pointer">
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
          <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-border rounded-xl hover:border-primary/40 hover:bg-muted/40 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-2">
              <QrCode className="w-5 h-5 text-muted-foreground" />
            </div>
            <p className="text-xs font-medium">Click to upload QR image</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">PNG, JPG, SVG · max 2MB</p>
          </div>
        </label>
      )}
    </div>
  );
}

function ContactRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <span className="text-xs text-muted-foreground w-28">{label}</span>
      <span className="text-sm font-semibold flex-1">{value}</span>
    </div>
  );
}

// ============================================================
// Clinic config section (editable contact + hours + social)
// ============================================================

function ClinicConfigSection() {
  const [config, setConfig] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/admin/clinic-config")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setConfig(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const update = (k: string, v: string) =>
    setConfig((p: any) => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/clinic-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Clinic settings saved", {
          description: `${data.updated} fields updated.`,
        });
      } else {
        toast.error("Save failed", { description: data.error });
      }
    } catch {
      toast.error("Save failed", { description: "Network error." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SectionCard icon={Phone} title="Clinic contact & social" description="Loading...">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      icon={Phone}
      title="Clinic contact & social"
      description="These values appear across the website (footer, contact page, floating WhatsApp, JSON-LD). Changes take effect immediately."
    >
      {/* Contact */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Contact
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Clinic name" value={config?.clinicName || ""} onChange={(v) => update("clinicName", v)} placeholder="The Dietitian's Clinic" />
          <Field label="Email" value={config?.email || ""} onChange={(v) => update("email", v)} placeholder="care@thedietitiansclinic.com" />
          <Field label="Phone (display)" value={config?.phoneDisplay || ""} onChange={(v) => update("phoneDisplay", v)} placeholder="+977-1-4445566" />
          <Field label="Phone (raw, for tel:)" value={config?.phoneRaw || ""} onChange={(v) => update("phoneRaw", v)} placeholder="+97714445566" />
          <Field label="WhatsApp (display)" value={config?.whatsappDisplay || ""} onChange={(v) => update("whatsappDisplay", v)} placeholder="+977 9800000000" />
          <Field label="WhatsApp (raw, for wa.me)" value={config?.whatsappRaw || ""} onChange={(v) => update("whatsappRaw", v)} placeholder="9779800000000" />
        </div>
        <div className="mt-3">
          <Field label="Address" value={config?.address || ""} onChange={(v) => update("address", v)} placeholder="Dharan-14, Sunsari, Nepal" />
        </div>
      </div>

      <Separator />

      {/* Hours */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Opening hours
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Weekday hours" value={config?.weekdayHours || ""} onChange={(v) => update("weekdayHours", v)} placeholder="7:00 AM – 8:00 PM" />
          <Field label="Saturday hours" value={config?.saturdayHours || ""} onChange={(v) => update("saturdayHours", v)} placeholder="8:00 AM – 6:00 PM" />
        </div>
      </div>

      <Separator />

      {/* Social */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Social media
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Instagram URL" value={config?.instagram || ""} onChange={(v) => update("instagram", v)} placeholder="https://instagram.com/..." />
          <Field label="Facebook URL" value={config?.facebook || ""} onChange={(v) => update("facebook", v)} placeholder="https://facebook.com/..." />
          <Field label="Twitter/X URL" value={config?.twitter || ""} onChange={(v) => update("twitter", v)} placeholder="https://twitter.com/..." />
          <Field label="YouTube URL" value={config?.youtube || ""} onChange={(v) => update("youtube", v)} placeholder="https://youtube.com/..." />
          <Field label="LinkedIn URL" value={config?.linkedin || ""} onChange={(v) => update("linkedin", v)} placeholder="https://linkedin.com/..." />
        </div>
      </div>

      <div className="pt-2">
        <Button onClick={save} disabled={saving} className="bg-gradient-to-r from-primary to-secondary">
          {saving ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              Save clinic settings
            </>
          )}
        </Button>
      </div>
    </SectionCard>
  );
}

// ============================================================
// Change password section
// ============================================================

function ChangePasswordSection() {
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const handleChange = async () => {
    if (!currentPassword || !newPassword) return;
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password too short", { description: "Minimum 8 characters." });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password changed!", { description: "Use your new password next time you log in." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error("Failed", { description: data.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SectionCard
      icon={ShieldCheck}
      title="Account security"
      description="Change your admin password. Use a strong password with at least 8 characters."
    >
      <div className="space-y-3 max-w-md">
        <div>
          <Label className="text-xs">Current password</Label>
          <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="h-10" placeholder="••••••••" />
        </div>
        <div>
          <Label className="text-xs">New password</Label>
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-10" placeholder="••••••••" minLength={8} />
        </div>
        <div>
          <Label className="text-xs">Confirm new password</Label>
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-10" placeholder="••••••••" />
        </div>
        {newPassword && newPassword !== confirmPassword && (
          <p className="text-xs text-rose-600">Passwords don&apos;t match</p>
        )}
        <Button onClick={handleChange} disabled={saving || !currentPassword || !newPassword || newPassword !== confirmPassword} className="bg-gradient-to-r from-primary to-secondary">
          {saving ? (
            <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1.5" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-1.5" /> Change password</>
          )}
        </Button>
      </div>
    </SectionCard>
  );
}

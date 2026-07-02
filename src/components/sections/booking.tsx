"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  FileText,
  CreditCard,
  CheckCircle2,
  Upload,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { services, dietitians, programs } from "@/lib/data";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createBooking } from "@/lib/actions/contact";

const steps = [
  { id: 0, label: "Service", icon: FileText },
  { id: 1, label: "Dietitian", icon: User },
  { id: 2, label: "Schedule", icon: Calendar },
  { id: 3, label: "Your info", icon: User },
  { id: 4, label: "Payment", icon: CreditCard },
  { id: 5, label: "Done", icon: CheckCircle2 },
];

const timeSlots = [
  "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
  "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  "05:00 PM", "06:00 PM",
];

const nextDays = Array.from({ length: 14 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return d;
});

export function Booking() {
  const [step, setStep] = React.useState(0);
  const [data, setData] = React.useState({
    service: "",
    dietitian: "",
    date: "",
    time: "",
    name: "",
    email: "",
    phone: "",
    age: "",
    goal: "",
    medical: "",
    reports: [] as string[],
    program: "",
    paymentMethod: "khalti",
  });

  const update = (k: string, v: string) => setData((p) => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!data.service;
    if (step === 1) return !!data.dietitian;
    if (step === 2) return !!data.date && !!data.time;
    if (step === 3) return !!data.name && !!data.email && !!data.phone;
    if (step === 4) return !!data.paymentMethod;
    return true;
  };

  const next = () => {
    if (!canNext()) return;
    if (step < 5) setStep(step + 1);
  };
  const prev = () => step > 0 && setStep(step - 1);

  const [submitting, setSubmitting] = React.useState(false);

  const finalize = async () => {
    setSubmitting(true);
    try {
      const result = await createBooking(data);
      if (result.success) {
        setStep(5);
        toast.success("Booking confirmed!", {
          description: `A confirmation email is on its way to ${data.email}.`,
        });
      } else {
        toast.error("Booking failed", {
          description: result.error || "Please try again.",
        });
      }
    } catch (e) {
      toast.error("Booking failed", {
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const selectedService = services.find((s) => s.slug === data.service);
  const selectedDietitian = dietitians.find((d) => d.id === data.dietitian);
  const selectedProgram = programs.find((p) => p.id === data.program);

  return (
    <SectionWrapper id="booking" className="bg-background relative overflow-hidden">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-mesh rounded-full opacity-20 blur-3xl pointer-events-none" />

      <SectionHeader
        eyebrow="Book your consultation"
        title={
          <>
            Your transformation starts in{" "}
            <span className="gradient-text">5 simple steps</span>
          </>
        }
        description="Reserve your slot in under 2 minutes. Free 15-minute discovery calls available — no payment required."
      />

      <div className="mt-12 max-w-5xl mx-auto">
        {/* Stepper */}
        <div className="mb-8 hidden sm:flex items-center justify-between">
          {steps.map((s, i) => (
            <React.Fragment key={s.id}>
              <button
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className="flex flex-col items-center gap-2 disabled:cursor-not-allowed"
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                    i < step && "bg-primary border-primary text-primary-foreground",
                    i === step && "border-primary text-primary bg-primary/10 ring-4 ring-primary/20",
                    i > step && "border-border text-muted-foreground"
                  )}
                >
                  {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    i === step ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {s.label}
                </span>
              </button>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 -mt-6 transition-colors",
                    i < step ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Mobile stepper */}
        <div className="sm:hidden mb-6 flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Step {step + 1} of {steps.length}
          </span>
          <span className="text-sm font-semibold">{steps[step].label}</span>
        </div>
        <div className="sm:hidden mb-8 h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main panel */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-premium"
              >
                {/* Step 0: Service */}
                {step === 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-1">What would you like help with?</h3>
                    <p className="text-sm text-muted-foreground mb-6">Choose the service that best matches your goal.</p>
                    <div className="grid sm:grid-cols-2 gap-2.5 max-h-[400px] overflow-y-auto pr-2">
                      {services.map((s) => (
                        <button
                          key={s.slug}
                          onClick={() => update("service", s.slug)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                            data.service === s.slug
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/40 hover:bg-muted/40"
                          )}
                        >
                          <div className={cn("w-9 h-9 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0", s.accent)}>
                            <s.icon className="w-4 h-4 text-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{s.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.tagline}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 1: Dietitian */}
                {step === 1 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Choose your dietitian</h3>
                    <p className="text-sm text-muted-foreground mb-6">Pick a specialist, or skip to be matched automatically.</p>
                    <div className="space-y-2.5">
                      {dietitians.map((d) => (
                        <button
                          key={d.id}
                          onClick={() => update("dietitian", d.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-3 rounded-xl border text-left transition-all",
                            data.dietitian === d.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/40 hover:bg-muted/40"
                          )}
                        >
                          <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold flex-shrink-0", d.accent)}>
                            {d.initials}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.specialty} · {d.experience}+ yrs</p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs font-semibold">{d.rating}</span>
                              <span className="text-xs text-muted-foreground">· {d.reviews} reviews</span>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              {d.availability.split(":")[0]}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 2: Schedule */}
                {step === 2 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Pick a date & time</h3>
                    <p className="text-sm text-muted-foreground mb-6">All times are in Nepal Standard Time (GMT+5:45).</p>

                    <div className="mb-6">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Next 14 days</p>
                      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                        {nextDays.map((d) => {
                          const key = d.toISOString().split("T")[0];
                          const isToday = d.toDateString() === new Date().toDateString();
                          return (
                            <button
                              key={key}
                              onClick={() => update("date", key)}
                              className={cn(
                                "flex-shrink-0 w-16 py-3 rounded-xl border flex flex-col items-center transition-all",
                                data.date === key
                                  ? "border-primary bg-primary text-primary-foreground shadow-glow"
                                  : "border-border hover:border-primary/40"
                              )}
                            >
                              <span className="text-[10px] uppercase font-semibold tracking-wider opacity-70">
                                {d.toLocaleDateString("en-US", { weekday: "short" })}
                              </span>
                              <span className="text-lg font-bold mt-0.5">{d.getDate()}</span>
                              <span className="text-[10px] opacity-70">
                                {d.toLocaleDateString("en-US", { month: "short" })}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {data.date && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Available times</p>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              onClick={() => update("time", slot)}
                              className={cn(
                                "py-2.5 px-2 rounded-lg border text-sm font-medium transition-all",
                                data.time === slot
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border hover:border-primary/40 hover:bg-muted/40"
                              )}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}

                {/* Step 3: Patient info */}
                {step === 3 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Tell us about you</h3>
                    <p className="text-sm text-muted-foreground mb-6">This helps your dietitian prepare for your session.</p>

                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="name" className="text-xs">Full name *</Label>
                        <Input id="name" value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Sneha Karki" className="h-11" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="age" className="text-xs">Age</Label>
                        <Input id="age" type="number" value={data.age} onChange={(e) => update("age", e.target.value)} placeholder="29" className="h-11" />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-xs">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="email" type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" className="h-11 pl-9" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="phone" className="text-xs">Phone *</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input id="phone" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+977 98XXXXXXXX" className="h-11 pl-9" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <Label htmlFor="goal" className="text-xs">Your primary goal</Label>
                      <Textarea id="goal" value={data.goal} onChange={(e) => update("goal", e.target.value)} placeholder="e.g. Lose 8 kg in 3 months, regulate my cycle, manage gestational diabetes..." className="resize-none" rows={2} />
                    </div>
                    <div className="space-y-1.5 mb-4">
                      <Label htmlFor="medical" className="text-xs">Medical history (optional)</Label>
                      <Textarea id="medical" value={data.medical} onChange={(e) => update("medical", e.target.value)} placeholder="Any conditions, medications, allergies, previous surgeries..." className="resize-none" rows={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Upload recent reports (optional)</Label>
                      <div className="rounded-xl border-2 border-dashed border-border p-6 text-center hover:border-primary/40 hover:bg-muted/40 transition-colors cursor-pointer">
                        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Drop files here or click to upload</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG · up to 10MB each</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Payment */}
                {step === 4 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Choose a program & payment method</h3>
                    <p className="text-sm text-muted-foreground mb-6">Your first discovery call is always free — payment starts your program.</p>

                    <div className="space-y-2 mb-6">
                      {programs.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => update("program", p.id)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                            data.program === p.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/40"
                          )}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold">{p.duration}</p>
                              {p.popular && (
                                <Badge className="bg-primary/15 text-primary border-0 text-[10px]">Popular</Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{p.tagline}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-base font-bold">Rs. {p.price.toLocaleString()}</p>
                            <p className="text-[10px] text-muted-foreground line-through">Rs. {p.originalPrice.toLocaleString()}</p>
                          </div>
                        </button>
                      ))}
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Payment method</p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "khalti", label: "Khalti", color: "bg-purple-500" },
                        { id: "esewa", label: "eSewa", color: "bg-green-500" },
                        { id: "stripe", label: "Card", color: "bg-sky-500" },
                      ].map((m) => (
                        <button
                          key={m.id}
                          onClick={() => update("paymentMethod", m.id)}
                          className={cn(
                            "p-3 rounded-xl border text-center transition-all",
                            data.paymentMethod === m.id
                              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                              : "border-border hover:border-primary/40"
                          )}
                        >
                          <div className={cn("w-8 h-8 rounded-lg mx-auto mb-1.5", m.color)} />
                          <p className="text-xs font-semibold">{m.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 5: Confirmation */}
                {step === 5 && (
                  <div className="text-center py-8">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", damping: 12, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                    </motion.div>
                    <h3 className="text-2xl font-bold mb-2">You&apos;re all set, {data.name.split(" ")[0]}! 🎉</h3>
                    <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                      A confirmation email has been sent to <span className="font-semibold text-foreground">{data.email}</span>.
                      Your dietitian will reach out 24 hours before your appointment.
                    </p>

                    <div className="max-w-sm mx-auto text-left rounded-2xl bg-muted/50 p-5 space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Service</span>
                        <span className="font-semibold">{selectedService?.title}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Dietitian</span>
                        <span className="font-semibold">{selectedDietitian?.name}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-semibold">
                          {data.date && new Date(data.date).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Time</span>
                        <span className="font-semibold">{data.time}</span>
                      </div>
                      {selectedProgram && (
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-border/40">
                          <span className="text-muted-foreground">Program</span>
                          <span className="font-semibold text-primary">{selectedProgram.duration} · Rs. {selectedProgram.price.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 pt-2">
                        <Mail className="w-3 h-3" />
                        <span>Calendar invite + meeting link sent</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setStep(0);
                        setData({ service: "", dietitian: "", date: "", time: "", name: "", email: "", phone: "", age: "", goal: "", medical: "", reports: [], program: "", paymentMethod: "khalti" });
                      }}
                      variant="outline"
                      className="mt-6"
                    >
                      Book another consultation
                    </Button>
                  </div>
                )}

                {/* Nav buttons */}
                {step < 5 && (
                  <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
                    <Button
                      variant="ghost"
                      onClick={prev}
                      disabled={step === 0}
                      className="text-muted-foreground"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back
                    </Button>
                    <Button
                      onClick={step === 4 ? finalize : next}
                      disabled={!canNext() || submitting}
                      className="bg-gradient-to-r from-primary to-secondary"
                    >
                      {submitting && step === 4 ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          {step === 4 ? "Confirm booking" : "Continue"}
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Summary sidebar */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-premium">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Booking summary
              </h3>
              <div className="space-y-3 text-sm">
                <SummaryRow label="Service" value={selectedService?.title} />
                <SummaryRow label="Dietitian" value={selectedDietitian?.name} />
                <SummaryRow
                  label="Date"
                  value={data.date ? new Date(data.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : undefined}
                />
                <SummaryRow label="Time" value={data.time} />
                <SummaryRow label="Name" value={data.name} />
                <SummaryRow label="Program" value={selectedProgram?.duration} />
              </div>
              {selectedProgram && (
                <div className="mt-5 pt-5 border-t border-border/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-muted-foreground">Program cost</span>
                    <span className="text-lg font-bold">Rs. {selectedProgram.price.toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    First discovery call is free. Payment starts your program.
                  </p>
                </div>
              )}
              <div className="mt-5 p-3 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 text-xs text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span className="font-semibold">14-day money-back guarantee</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1.5 ml-5">
                  Not satisfied? Get a full refund, no questions asked.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}

function SummaryRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold text-right truncate max-w-[60%]">
        {value || <span className="text-muted-foreground/40 font-normal">—</span>}
      </span>
    </div>
  );
}

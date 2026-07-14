"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = [
  { id: 0, label: "Basic Info" },
  { id: 1, label: "Health Goals" },
  { id: 2, label: "Medical History" },
  { id: 3, label: "Lifestyle" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const [form, setForm] = React.useState({
    dateOfBirth: "",
    gender: "",
    height: "",
    currentWeight: "",
    targetWeight: "",
    primaryGoal: "",
    conditions: "",
    medicalHistory: "",
    allergies: "",
    medications: "",
    dietaryPreferences: "",
    activityLevel: "",
    sleepHours: "",
    waterIntake: "",
    stressLevel: "",
  });

  React.useEffect(() => {
    fetch("/api/client/onboarding")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data?.onboardingCompleted) {
          router.push("/dashboard");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  const update = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const canNext = () => {
    if (step === 0) return !!form.height && !!form.currentWeight;
    if (step === 1) return !!form.primaryGoal;
    if (step === 2) return true;
    return true;
  };

  const submit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/client/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Assessment complete!", {
          description: "Your dietitian will review and create your plan.",
        });
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error("Submission failed", { description: data.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">Health Assessment</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              i === step ? "bg-primary text-primary-foreground" :
              i < step ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" :
              "bg-muted text-muted-foreground"
            )}>
              {i < step ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-3.5 h-3.5 flex items-center justify-center">{i + 1}</span>}
              <span className="hidden sm:inline">{s.label}</span>
            </div>
            {i < steps.length - 1 && <div className="h-px flex-1 bg-border" />}
          </div>
        ))}
      </div>

      <motion.div
        key={step}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="max-w-2xl"
      >
        {/* Step 0: Basic Info */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Date of birth</Label>
                <Input type="date" value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)} className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Gender</Label>
                <select value={form.gender} onChange={(e) => update("gender", e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm">
                  <option value="">Prefer not to say</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Height (cm) *</Label>
                <Input type="number" value={form.height} onChange={(e) => update("height", e.target.value)} placeholder="170" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Current weight (kg) *</Label>
                <Input type="number" value={form.currentWeight} onChange={(e) => update("currentWeight", e.target.value)} placeholder="75" className="h-11" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Target weight (kg)</Label>
                <Input type="number" value={form.targetWeight} onChange={(e) => update("targetWeight", e.target.value)} placeholder="68" className="h-11" />
              </div>
            </div>
            {/* BMI preview */}
            {form.height && form.currentWeight && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                {(() => {
                  const h = parseFloat(form.height) / 100;
                  const w = parseFloat(form.currentWeight);
                  const bmi = w / (h * h);
                  const category = bmi < 18.5 ? "Underweight" : bmi < 25 ? "Normal" : bmi < 30 ? "Overweight" : "Obese";
                  const color = bmi < 18.5 ? "text-sky-600" : bmi < 25 ? "text-emerald-600" : bmi < 30 ? "text-amber-600" : "text-rose-600";
                  return (
                    <p className="text-sm">
                      Your BMI: <span className={cn("font-bold", color)}>{bmi.toFixed(1)}</span> ({category})
                    </p>
                  );
                })()}
              </div>
            )}
          </div>
        )}

        {/* Step 1: Health Goals */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">What is your primary health goal? *</Label>
              <Textarea
                value={form.primaryGoal}
                onChange={(e) => update("primaryGoal", e.target.value)}
                placeholder="e.g. Lose 8 kg in 3 months, regulate my menstrual cycle, manage gestational diabetes, build muscle..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Any specific health conditions? (PMOS, diabetes, thyroid, hypertension, etc.)</Label>
              <Input
                value={form.conditions}
                onChange={(e) => update("conditions", e.target.value)}
                placeholder="e.g. PMOS, pre-diabetes, hypothyroidism"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Dietary preferences or restrictions</Label>
              <Input
                value={form.dietaryPreferences}
                onChange={(e) => update("dietaryPreferences", e.target.value)}
                placeholder="e.g. Vegetarian, vegan, gluten-free, no dairy"
                className="h-11"
              />
            </div>
          </div>
        )}

        {/* Step 2: Medical History */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Medical history</Label>
              <Textarea
                value={form.medicalHistory}
                onChange={(e) => update("medicalHistory", e.target.value)}
                placeholder="Any past surgeries, hospitalizations, chronic conditions, or relevant medical events..."
                rows={3}
                className="resize-none"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Allergies</Label>
                <Input
                  value={form.allergies}
                  onChange={(e) => update("allergies", e.target.value)}
                  placeholder="e.g. peanuts, lactose, none"
                  className="h-11"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Current medications</Label>
                <Input
                  value={form.medications}
                  onChange={(e) => update("medications", e.target.value)}
                  placeholder="e.g. Metformin 500mg, Levothyroxine"
                  className="h-11"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Lifestyle */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Activity level</Label>
              <select value={form.activityLevel} onChange={(e) => update("activityLevel", e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm">
                <option value="">Select...</option>
                <option value="sedentary">Sedentary (little or no exercise)</option>
                <option value="light">Light (1-3 days/week)</option>
                <option value="moderate">Moderate (3-5 days/week)</option>
                <option value="active">Active (6-7 days/week)</option>
                <option value="very_active">Very Active (2x/day, athlete)</option>
              </select>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Sleep (hours/night)</Label>
                <Input type="number" value={form.sleepHours} onChange={(e) => update("sleepHours", e.target.value)} placeholder="7" className="h-11" min={0} max={24} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Water (liters/day)</Label>
                <Input type="number" value={form.waterIntake} onChange={(e) => update("waterIntake", e.target.value)} placeholder="2" className="h-11" min={0} max={20} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Stress level (1-10)</Label>
                <Input type="number" value={form.stressLevel} onChange={(e) => update("stressLevel", e.target.value)} placeholder="5" className="h-11" min={1} max={10} />
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="ghost"
            onClick={() => step > 0 && setStep(step - 1)}
            disabled={step === 0 || saving}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          {step < steps.length - 1 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canNext()}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={submit}
              disabled={saving}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Submit Assessment
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </>
  );
}

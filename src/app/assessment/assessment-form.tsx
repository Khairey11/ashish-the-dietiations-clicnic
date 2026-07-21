"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Target, Activity, FileText, Scale, Upload,
  ChevronLeft, ChevronRight, Check, Loader2, Info, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const steps = [
  { id: 0, label: "Personal", icon: User },
  { id: 1, label: "Health Goals", icon: Target },
  { id: 2, label: "Lifestyle", icon: Activity },
  { id: 3, label: "Medical", icon: FileText },
  { id: 4, label: "Body Comp (Optional)", icon: Scale },
  { id: 5, label: "Upload (Optional)", icon: Upload },
];

const healthGoals = [
  "Weight Loss", "Weight Gain", "Diabetes Management", "PCOS / PCOD",
  "Thyroid Disorders", "Pregnancy Nutrition", "Child Nutrition",
  "Sports Nutrition", "Gut Health", "Hormonal Imbalance",
  "Cholesterol Management", "Blood Pressure", "General Wellness", "Other",
];

const activityLevels = [
  { value: "sedentary", label: "Sedentary (little/no exercise)" },
  { value: "light", label: "Light (1-3 days/week)" },
  { value: "moderate", label: "Moderate (3-5 days/week)" },
  { value: "active", label: "Active (6-7 days/week)" },
  { value: "very-active", label: "Very Active (2x/day, athlete)" },
];

const dietaryPreferences = [
  "Vegetarian", "Vegan", "Non-Vegetarian", "Eggetarian",
  "Pescatarian", "Gluten-Free", "Dairy-Free", "Keto", "Low-Carb", "No restrictions",
];

export function AssessmentForm() {
  const router = useRouter();
  const [step, setStep] = React.useState(0);
  const [submitting, setSubmitting] = React.useState(false);
  const [uploadedFiles, setUploadedFiles] = React.useState<string[]>([]);

  const [data, setData] = React.useState({
    // Step 0: Personal
    name: "", email: "", phone: "", age: "", gender: "",
    // Step 1: Health Goals
    goals: [] as string[], otherGoal: "",
    // Step 2: Lifestyle
    occupation: "", schedule: "", activityLevel: "", exerciseRoutine: "",
    sleepQuality: "", stressLevel: "", smoking: "", alcohol: "",
    waterIntake: "", dietaryPrefs: [] as string[],
    // Step 3: Medical
    conditions: "", medications: "", allergies: "", familyHistory: "",
    surgeries: "", previousTreatments: "", ongoingConcerns: "",
    // Step 4: Body Composition (all optional)
    weight: "", height: "", bmi: "", bodyFat: "", muscleMass: "",
    skeletalMuscle: "", visceralFat: "", boneDensity: "", totalBodyWater: "",
    bmr: "", metabolicAge: "", waist: "", hip: "", chest: "", otherBodyComp: "",
    // Step 5: Upload (optional)
    fileUrls: [] as string[],
  });

  const update = (key: string, value: unknown) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: string, item: string) => {
    setData((prev) => {
      const arr = prev[key as keyof typeof prev] as string[];
      return {
        ...prev,
        [key]: arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item],
      };
    });
  };

  const canNext = () => {
    if (step === 0) return data.name && data.email && data.phone && data.age;
    if (step === 1) return data.goals.length > 0;
    if (step === 2) return data.activityLevel;
    if (step === 3) return true; // Medical history can be empty
    if (step === 4) return true; // Optional
    if (step === 5) return true; // Optional
    return true;
  };

  const next = () => {
    if (!canNext()) {
      toast.error("Please fill in the required fields");
      return;
    }
    if (step < steps.length - 1) setStep(step + 1);
  };

  const prev = () => step > 0 && setStep(step - 1);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const d = await res.json();
        if (d.success) {
          setUploadedFiles((prev) => [...prev, d.url]);
          update("fileUrls", [...uploadedFiles, d.url]);
          toast.success(`${file.name} uploaded`);
        } else {
          toast.error(`Failed to upload ${file.name}`, { description: d.error });
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const d = await res.json();
      if (d.success) {
        toast.success("Assessment submitted!", {
          description: "Your dietitian will review your information. We'll notify you once your consultation is approved.",
        });
        setTimeout(() => router.push("/assessment/success"), 1500);
      } else {
        toast.error("Submission failed", { description: d.error });
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              {steps.map((s, i) => (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <button
                    onClick={() => i < step && setStep(i)}
                    disabled={i > step}
                    className={cn(
                      "flex items-center gap-2 text-xs font-medium transition-colors",
                      i === step ? "text-primary" : i < step ? "text-primary/60 cursor-pointer" : "text-muted-foreground/40"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0",
                      i === step ? "border-primary bg-primary/10" : i < step ? "border-primary bg-primary text-primary-foreground" : "border-border"
                    )}>
                      {i < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={cn("flex-1 h-0.5 mx-2 transition-colors", i < step ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Form card */}
          <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-premium">
            <AnimatePresence mode="wait">
              {/* Step 0: Personal Info */}
              {step === 0 && (
                <motion.div key="step-0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl font-semibold mb-1">Personal Information</h2>
                  <p className="text-sm text-muted-foreground mb-6">Tell us a bit about yourself.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Full Name *</Label>
                      <Input value={data.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Email *</Label>
                      <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} placeholder="you@email.com" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Phone *</Label>
                      <Input type="tel" value={data.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+977 9800000000" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Age *</Label>
                      <Input type="number" value={data.age} onChange={(e) => update("age", e.target.value)} placeholder="30" className="h-11" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Gender</Label>
                      <div className="flex gap-2">
                        {["Male", "Female", "Other", "Prefer not to say"].map((g) => (
                          <button
                            key={g}
                            onClick={() => update("gender", g)}
                            className={cn("px-4 py-2.5 rounded-lg border text-sm font-medium transition-all", data.gender === g ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40")}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 1: Health Goals */}
              {step === 1 && (
                <motion.div key="step-1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl font-semibold mb-1">What are your health goals?</h2>
                  <p className="text-sm text-muted-foreground mb-6">Select all that apply. This helps us match you with the right dietitian.</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {healthGoals.map((goal) => (
                      <button
                        key={goal}
                        onClick={() => toggleArrayItem("goals", goal)}
                        className={cn("flex items-center gap-2 p-3 rounded-xl border text-sm text-left transition-all", data.goals.includes(goal) ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:border-primary/40")}
                      >
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0", data.goals.includes(goal) ? "border-primary bg-primary" : "border-muted-foreground/30")}>
                          {data.goals.includes(goal) && <Check className="w-2.5 h-2.5 text-primary-foreground" />}
                        </div>
                        {goal}
                      </button>
                    ))}
                  </div>
                  {data.goals.includes("Other") && (
                    <div className="mt-4 space-y-1.5">
                      <Label className="text-xs">Please specify your goal</Label>
                      <Input value={data.otherGoal} onChange={(e) => update("otherGoal", e.target.value)} placeholder="Describe your goal" className="h-11" />
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 2: Lifestyle */}
              {step === 2 && (
                <motion.div key="step-2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl font-semibold mb-1">Lifestyle Information</h2>
                  <p className="text-sm text-muted-foreground mb-6">Your daily habits help us create a realistic plan.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Occupation</Label>
                      <Input value={data.occupation} onChange={(e) => update("occupation", e.target.value)} placeholder="e.g. Software Engineer" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Daily Schedule</Label>
                      <Input value={data.schedule} onChange={(e) => update("schedule", e.target.value)} placeholder="e.g. 9-5 desk job" className="h-11" />
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Physical Activity Level *</Label>
                      <div className="space-y-1.5">
                        {activityLevels.map((a) => (
                          <button key={a.value} onClick={() => update("activityLevel", a.value)} className={cn("w-full flex items-center gap-2 p-3 rounded-lg border text-sm text-left transition-all", data.activityLevel === a.value ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40")}>
                            <div className={cn("w-4 h-4 rounded-full border-2 flex-shrink-0", data.activityLevel === a.value ? "border-primary bg-primary" : "border-muted-foreground/30")} />
                            {a.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Exercise Routine</Label>
                      <Input value={data.exerciseRoutine} onChange={(e) => update("exerciseRoutine", e.target.value)} placeholder="e.g. 30min walk, 3x/week" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Sleep Quality</Label>
                      <select value={data.sleepQuality} onChange={(e) => update("sleepQuality", e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm">
                        <option value="">Select...</option>
                        <option value="excellent">Excellent (7-8 hrs, restful)</option>
                        <option value="good">Good (6-7 hrs)</option>
                        <option value="fair">Fair (5-6 hrs, interrupted)</option>
                        <option value="poor">Poor (under 5 hrs or insomnia)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Stress Level</Label>
                      <select value={data.stressLevel} onChange={(e) => update("stressLevel", e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm">
                        <option value="">Select...</option>
                        <option value="low">Low</option>
                        <option value="moderate">Moderate</option>
                        <option value="high">High</option>
                        <option value="severe">Severe</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Water Intake (glasses/day)</Label>
                      <Input type="number" value={data.waterIntake} onChange={(e) => update("waterIntake", e.target.value)} placeholder="8" className="h-11" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Smoking</Label>
                      <select value={data.smoking} onChange={(e) => update("smoking", e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm">
                        <option value="">Select...</option>
                        <option value="never">Never</option>
                        <option value="former">Former smoker</option>
                        <option value="occasional">Occasional</option>
                        <option value="regular">Regular</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Alcohol</Label>
                      <select value={data.alcohol} onChange={(e) => update("alcohol", e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm">
                        <option value="">Select...</option>
                        <option value="never">Never</option>
                        <option value="rarely">Rarely</option>
                        <option value="socially">Socially</option>
                        <option value="regularly">Regularly</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs">Dietary Preferences</Label>
                      <div className="flex flex-wrap gap-2">
                        {dietaryPreferences.map((d) => (
                          <button key={d} onClick={() => toggleArrayItem("dietaryPrefs", d)} className={cn("px-3 py-1.5 rounded-full border text-xs font-medium transition-all", data.dietaryPrefs.includes(d) ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40")}>
                            {d}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Medical History */}
              {step === 3 && (
                <motion.div key="step-3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-xl font-semibold mb-1">Medical History</h2>
                  <p className="text-sm text-muted-foreground mb-6">This information is confidential and helps your dietitian create a safe plan.</p>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Diagnosed Conditions</Label>
                      <Textarea value={data.conditions} onChange={(e) => update("conditions", e.target.value)} placeholder="e.g. Type 2 Diabetes (2022), Hypothyroidism, PCOS..." className="min-h-[80px]" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Current Medications</Label>
                        <Textarea value={data.medications} onChange={(e) => update("medications", e.target.value)} placeholder="e.g. Metformin 500mg, Levothyroxine..." className="min-h-[80px]" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Allergies</Label>
                        <Textarea value={data.allergies} onChange={(e) => update("allergies", e.target.value)} placeholder="e.g. Lactose intolerant, peanut allergy..." className="min-h-[80px]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Family Medical History</Label>
                      <Textarea value={data.familyHistory} onChange={(e) => update("familyHistory", e.target.value)} placeholder="e.g. Father: Type 2 Diabetes, Mother: Hypertension..." className="min-h-[80px]" />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs">Previous Surgeries</Label>
                        <Textarea value={data.surgeries} onChange={(e) => update("surgeries", e.target.value)} placeholder="List any surgeries with year..." className="min-h-[80px]" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs">Previous Treatments</Label>
                        <Textarea value={data.previousTreatments} onChange={(e) => update("previousTreatments", e.target.value)} placeholder="Previous diet programs, therapies..." className="min-h-[80px]" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Ongoing Health Concerns</Label>
                      <Textarea value={data.ongoingConcerns} onChange={(e) => update("ongoingConcerns", e.target.value)} placeholder="Anything else your dietitian should know?" className="min-h-[80px]" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Body Composition (Optional) */}
              {step === 4 && (
                <motion.div key="step-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-primary">Optional:</strong> If you have access to body composition measurements
                      (from a professional machine, DEXA scan, or smart scale), fill in what you know.
                      Skip this section entirely if you don't have these measurements.
                    </p>
                  </div>
                  <h2 className="text-xl font-semibold mb-1">Body Composition</h2>
                  <p className="text-sm text-muted-foreground mb-6">All fields in this section are optional.</p>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      { key: "weight", label: "Weight (kg)", placeholder: "68.5" },
                      { key: "height", label: "Height (cm)", placeholder: "165" },
                      { key: "bmi", label: "BMI", placeholder: "25.2" },
                      { key: "bodyFat", label: "Body Fat (%)", placeholder: "24.5" },
                      { key: "muscleMass", label: "Muscle Mass (kg)", placeholder: "28.0" },
                      { key: "skeletalMuscle", label: "Skeletal Muscle (%)", placeholder: "42.0" },
                      { key: "visceralFat", label: "Visceral Fat Level", placeholder: "8" },
                      { key: "boneDensity", label: "Bone Density (g/cm²)", placeholder: "1.2" },
                      { key: "totalBodyWater", label: "Total Body Water (%)", placeholder: "55" },
                      { key: "bmr", label: "BMR (kcal)", placeholder: "1450" },
                      { key: "metabolicAge", label: "Metabolic Age", placeholder: "28" },
                      { key: "waist", label: "Waist (cm)", placeholder: "85" },
                      { key: "hip", label: "Hip (cm)", placeholder: "95" },
                      { key: "chest", label: "Chest (cm)", placeholder: "90" },
                    ].map((f) => (
                      <div key={f.key} className="space-y-1.5">
                        <Label className="text-xs">{f.label}</Label>
                        <Input
                          type="number"
                          value={data[f.key as keyof typeof data] as string}
                          onChange={(e) => update(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className="h-11"
                        />
                      </div>
                    ))}
                    <div className="space-y-1.5 sm:col-span-2 lg:col-span-3">
                      <Label className="text-xs">Other Body Composition Metrics</Label>
                      <Input value={data.otherBodyComp} onChange={(e) => update("otherBodyComp", e.target.value)} placeholder="Any additional metrics from your body composition report" className="h-11" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Upload (Optional) */}
              {step === 5 && (
                <motion.div key="step-5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="flex items-start gap-2 mb-4 p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-primary">Optional:</strong> Upload blood reports, hormone panels, DEXA scans,
                      previous prescriptions, or any health documents that may help your dietitian.
                      Supported: PDF, JPG, PNG. Max 5MB per file.
                    </p>
                  </div>
                  <h2 className="text-xl font-semibold mb-1">Upload Medical Reports</h2>
                  <p className="text-sm text-muted-foreground mb-6">This step is entirely optional — you can skip it and provide reports later.</p>

                  <label
                    className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl border-2 border-dashed border-border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Upload className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Click to upload files</p>
                      <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG · max 5MB each</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e.target.files)}
                    />
                  </label>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Uploaded files</p>
                      {uploadedFiles.map((url, i) => (
                        <div key={url} className="flex items-center gap-2 p-2.5 rounded-lg border border-border/60 bg-muted/30">
                          <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-xs flex-1 truncate">{url.split("/").pop()}</span>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/40">
              <Button variant="ghost" onClick={prev} disabled={step === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              {step < steps.length - 1 ? (
                <Button onClick={next} disabled={!canNext()} className="bg-gradient-to-r from-primary to-secondary">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={submit} disabled={submitting} className="bg-gradient-to-r from-primary to-secondary">
                  {submitting ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
                  Submit Assessment
                </Button>
              )}
            </div>

            {/* Skip optional steps */}
            {(step === 4 || step === 5) && (
              <div className="text-center mt-3">
                <button onClick={next} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                  Skip this step →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

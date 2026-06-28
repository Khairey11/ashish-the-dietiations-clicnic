"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Calculator, Activity, HeartPulse, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SectionHeader, SectionWrapper } from "./section-utils";
import { cn } from "@/lib/utils";

type BMIResult = {
  value: number;
  category: "Underweight" | "Normal" | "Overweight" | "Obese";
  color: string;
  advice: string;
  recommendedProgram?: string;
};

export function BMICalculator() {
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [age, setAge] = React.useState("");
  const [result, setResult] = React.useState<BMIResult | null>(null);

  const calculate = () => {
    const h = parseFloat(height) / 100;
    const w = parseFloat(weight);
    if (!h || !w || h <= 0) return;
    const bmi = w / (h * h);
    let category: BMIResult["category"];
    let color: string;
    let advice: string;
    let recommendedProgram: string;

    if (bmi < 18.5) {
      category = "Underweight";
      color = "text-sky-600 dark:text-sky-400";
      advice =
        "Your BMI suggests you may benefit from a healthy weight gain program focused on nutrient-dense foods and muscle building.";
      recommendedProgram = "Healthy Weight Gain";
    } else if (bmi < 25) {
      category = "Normal";
      color = "text-emerald-600 dark:text-emerald-400";
      advice =
        "Great work! Your BMI is in the healthy range. A lifestyle maintenance program can help you optimise body composition and long-term health.";
      recommendedProgram = "Lifestyle Modification";
    } else if (bmi < 30) {
      category = "Overweight";
      color = "text-amber-600 dark:text-amber-400";
      advice =
        "Your BMI indicates you're in the overweight range. A structured 90-day weight loss program with behavioural coaching can help you reach a healthier range.";
      recommendedProgram = "Weight Loss Program (90 days)";
    } else {
      category = "Obese";
      color = "text-rose-600 dark:text-rose-400";
      advice =
        "Your BMI is in the obese range. We recommend our 180-day transformation program with medical nutrition therapy and weekly dietitian support.";
      recommendedProgram = "Deep Transformation (180 days)";
    }

    setResult({ value: parseFloat(bmi.toFixed(1)), category, color, advice, recommendedProgram });
  };

  return (
    <SectionWrapper id="bmi-calculator" className="bg-background">
      <div className="grid lg:grid-cols-2 gap-10 items-center">
        {/* Left: copy + features */}
        <div>
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
            Free tool
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Know your numbers,
            <br />
            <span className="gradient-text">own your health</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-balance">
            Body Mass Index is a quick screening tool — but it's only the start.
            Get an instant snapshot, then let our dietitians turn it into a plan.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Calculator, label: "Instant BMI", value: "<1s" },
              { icon: Activity, label: "Body composition", value: "Pro" },
              { icon: HeartPulse, label: "Personalised plan", value: "Free" },
            ].map((f) => (
              <div
                key={f.label}
                className="rounded-2xl border border-border/60 bg-card p-4 text-center"
              >
                <f.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">{f.label}</p>
                <p className="text-sm font-bold mt-0.5">{f.value}</p>
              </div>
            ))}
          </div>

          {/* BMI scale visual */}
          <div className="mt-8">
            <div className="flex justify-between text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
              <span>Underweight</span>
              <span>Normal</span>
              <span>Overweight</span>
              <span>Obese</span>
            </div>
            <div className="h-2 rounded-full overflow-hidden flex">
              <div className="flex-1 bg-sky-400" />
              <div className="flex-1 bg-emerald-500" />
              <div className="flex-1 bg-amber-400" />
              <div className="flex-1 bg-rose-500" />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1.5 font-mono">
              <span>18.5</span>
              <span>25</span>
              <span>30</span>
              <span>40+</span>
            </div>
          </div>
        </div>

        {/* Right: calculator card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass rounded-3xl p-6 sm:p-8 shadow-premium"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">BMI Calculator</h3>
              <p className="text-xs text-muted-foreground">Free · No signup needed</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1.5">
              <Label htmlFor="height" className="text-xs">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                className="h-11"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65"
                className="h-11"
              />
            </div>
          </div>
          <div className="space-y-1.5 mb-6">
            <Label htmlFor="age" className="text-xs">Age (optional)</Label>
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="32"
              className="h-11"
            />
          </div>

          <Button
            onClick={calculate}
            className="w-full h-11 bg-gradient-to-r from-primary to-secondary"
            disabled={!height || !weight}
          >
            Calculate my BMI
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-6 pt-6 border-t border-border/40"
            >
              <div className="flex items-end justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Your BMI</p>
                  <p className={cn("text-5xl font-bold tracking-tight", result.color)}>
                    {result.value}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className={cn("text-lg font-semibold", result.color)}>
                    {result.category}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/50 p-4 mb-4">
                <p className="text-sm text-foreground/90 leading-relaxed">
                  {result.advice}
                </p>
              </div>
              {result.recommendedProgram && (
                <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5 border border-primary/20">
                  <div>
                    <p className="text-xs text-muted-foreground">Recommended program</p>
                    <p className="text-sm font-semibold text-primary">
                      {result.recommendedProgram}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => document.querySelector("#booking")?.scrollIntoView({ behavior: "smooth" })}
                    className="text-primary hover:text-primary hover:bg-primary/10"
                  >
                    Explore
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>
      </div>
    </SectionWrapper>
  );
}

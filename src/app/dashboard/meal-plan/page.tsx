"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Utensils, ChevronLeft, Loader2, Apple, Coffee, Moon, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type MealItem = {
  id: string;
  meal: string;
  name: string;
  calories: number;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  alternatives: string | null;
  notes: string | null;
  sortOrder: number;
};

type MealPlan = {
  id: string;
  title: string;
  description: string | null;
  totalCalories: number | null;
  proteinG: number | null;
  carbsG: number | null;
  fatG: number | null;
  startDate: string;
  endDate: string | null;
  dietitian: { name: string } | null;
  items: MealItem[];
};

const mealIcons: Record<string, typeof Apple> = {
  BREAKFAST: Coffee,
  LUNCH: Apple,
  DINNER: Moon,
  SNACK: Cookie,
};

const mealColors: Record<string, string> = {
  BREAKFAST: "from-amber-500/20 to-amber-500/5",
  LUNCH: "from-emerald-500/20 to-emerald-500/5",
  DINNER: "from-violet-500/20 to-violet-500/5",
  SNACK: "from-sky-500/20 to-sky-500/5",
};

export default function MealPlanPage() {
  const router = useRouter();
  const [plan, setPlan] = React.useState<MealPlan | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [checked, setChecked] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    fetch("/api/client/meal-plans")
      .then(async (r) => {
        if (r.status === 401) { router.push("/login?next=/dashboard/meal-plan"); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.success) setPlan(d.data);
      })
      .catch(() => toast.error("Failed to load meal plan"))
      .finally(() => setLoading(false));
  }, [router]);

  const toggleCheck = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group items by meal type
  const grouped = React.useMemo(() => {
    if (!plan) return {};
    const groups: Record<string, MealItem[]> = {};
    for (const item of plan.items) {
      if (!groups[item.meal]) groups[item.meal] = [];
      groups[item.meal].push(item);
    }
    return groups;
  }, [plan]);

  const mealOrder = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"];
  const totalCalories = plan?.items.reduce((sum, i) => sum + i.calories, 0) || 0;
  const checkedCount = checked.size;
  const totalItems = plan?.items.length || 0;

  if (loading) {
    return (
      <>
        <div className="mb-6"><Skeleton className="h-8 w-48" /></div>
        <Skeleton className="h-32 mb-4" />
        <Skeleton className="h-64" />
      </>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold">My Meal Plan</h1>
      </div>

      {!plan ? (
        <div className="text-center py-16 rounded-2xl border border-border/40 bg-card">
          <Utensils className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-semibold">No meal plan assigned yet</p>
          <p className="text-xs text-muted-foreground mt-1 mb-4">
            Your dietitian will create a personalized meal plan after your first consultation.
          </p>
          <Link href="/booking">
            <Button size="sm" className="bg-gradient-to-r from-primary to-secondary">Book consultation</Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Plan header */}
          <div className="p-5 rounded-2xl border border-border/40 bg-card mb-6">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-lg font-bold">{plan.title}</h2>
                {plan.description && <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>}
                <p className="text-xs text-muted-foreground mt-2">
                  Created by {plan.dietitian?.name || "Your dietitian"} ·
                  Started {new Date(plan.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/15 text-primary border-0">{totalCalories} cal/day</Badge>
                {plan.proteinG && <Badge variant="outline" className="text-xs">P: {plan.proteinG}g</Badge>}
                {plan.carbsG && <Badge variant="outline" className="text-xs">C: {plan.carbsG}g</Badge>}
                {plan.fatG && <Badge variant="outline" className="text-xs">F: {plan.fatG}g</Badge>}
              </div>
            </div>
            {/* Progress bar */}
            {totalItems > 0 && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Today's meals: {checkedCount}/{totalItems} completed</span>
                  <span>{Math.round((checkedCount / totalItems) * 100)}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all" style={{ width: `${(checkedCount / totalItems) * 100}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* Meals */}
          <div className="space-y-4">
            {mealOrder.map((mealType) => {
              const items = grouped[mealType];
              if (!items || items.length === 0) return null;
              const Icon = mealIcons[mealType] || Utensils;
              return (
                <div key={mealType} className="rounded-2xl border border-border/40 bg-card overflow-hidden">
                  <div className={cn("p-4 bg-gradient-to-r", mealColors[mealType])}>
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-primary" />
                      <h3 className="text-sm font-semibold uppercase tracking-wide">{mealType}</h3>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {items.reduce((sum, i) => sum + i.calories, 0)} cal
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-border/20">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => toggleCheck(item.id)}
                      >
                        <div className={cn(
                          "w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all",
                          checked.has(item.id) ? "bg-emerald-500 border-emerald-500" : "border-border"
                        )}>
                          {checked.has(item.id) && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={cn("text-sm font-medium", checked.has(item.id) && "line-through text-muted-foreground")}>{item.name}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span>{item.calories} cal</span>
                            {item.proteinG && <span>P: {item.proteinG}g</span>}
                            {item.carbsG && <span>C: {item.carbsG}g</span>}
                            {item.fatG && <span>F: {item.fatG}g</span>}
                          </div>
                          {item.alternatives && (
                            <p className="text-xs text-muted-foreground mt-1">
                              <span className="font-medium">Alternatives:</span> {item.alternatives}
                            </p>
                          )}
                          {item.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">{item.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}

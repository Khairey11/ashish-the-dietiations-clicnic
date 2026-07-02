import Link from "next/link";
import { Check, Star, ArrowRight, Zap, Crown, Shield } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { programs } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Programs & Pricing",
  description: "Choose from 5 transformation programs — 30 to 365 days. Every program includes 1:1 coaching, personalised meal plans, and progress tracking. 14-day money-back guarantee.",
};

const formatPrice = (n: number) => `Rs. ${n.toLocaleString()}`;

export default function ProgramsPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Programs & pricing"
        title={<>Choose your <span className="gradient-text">transformation timeline</span></>}
        description="From a 30-day kickstart to a full year of concierge wellness. Every program includes 1:1 coaching, personalised meal plans and progress tracking — with a 14-day money-back guarantee."
        accent="from-primary/15 to-secondary/10"
      />

      {/* Cards */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
            {programs.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "relative rounded-2xl bg-card border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-premium flex flex-col",
                  p.popular ? "border-primary shadow-glow ring-2 ring-primary/30" : "border-border/60"
                )}
              >
                {p.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground gap-1 shadow-glow">
                      <Star className="w-3 h-3 fill-current" />
                      Most popular
                    </Badge>
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-2xl font-bold">{p.duration}</span>
                    {p.days >= 365 ? <Crown className="w-5 h-5 text-amber-500" /> : p.days >= 90 ? <Zap className="w-5 h-5 text-primary" /> : null}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">{p.tagline}</p>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold tracking-tight">{formatPrice(p.price)}</span>
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(p.originalPrice)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">≈ Rs. {Math.round(p.price / p.days)}/day</p>
                  </div>

                  <div className="space-y-2 mb-4 flex-1">
                    {p.features.map((f) => (
                      <div key={f} className="flex items-start gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-border/40 mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Support</p>
                    <div className="space-y-1">
                      {p.support.map((s) => (
                        <p key={s} className="text-[11px] text-foreground/70">· {s}</p>
                      ))}
                    </div>
                  </div>

                  <Link href="/booking">
                    <Button
                      variant={p.popular ? "default" : "outline"}
                      className={cn("w-full", p.popular && "bg-gradient-to-r from-primary to-secondary")}
                    >
                      Get started
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Guarantee banner */}
          <div className="mt-10 rounded-2xl bg-primary/5 border border-primary/20 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">14-day money-back guarantee</h3>
              <p className="text-sm text-muted-foreground mt-0.5">Try any program risk-free. If it's not for you, get a full refund within 14 days — no questions asked.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">Compare programs side by side</h2>
          <p className="text-center text-sm text-muted-foreground mb-8">Every program includes a money-back guarantee within the first 14 days.</p>

          <div className="overflow-x-auto rounded-2xl border border-border/60 bg-card">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="border-b border-border/60 bg-muted/40">
                  <th className="text-left p-4 text-sm font-semibold">Feature</th>
                  {programs.map((p) => (
                    <th key={p.id} className={cn("p-4 text-sm font-semibold text-center min-w-[140px]", p.popular && "bg-primary/5")}>
                      {p.duration}
                      {p.popular && <span className="block text-[10px] text-primary mt-0.5">★ Most popular</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm">
                {[
                  { label: "Price", getValue: (p) => formatPrice(p.price) },
                  { label: "Per-day cost", getValue: (p) => `Rs. ${Math.round(p.price / p.days)}` },
                  { label: "1:1 consultations", getValue: (p) => p.days <= 30 ? "1 session" : p.days <= 60 ? "3 sessions" : p.days <= 90 ? "6 sessions" : p.days <= 180 ? "Bi-weekly" : "Unlimited" },
                  { label: "Personalised meal plan", getValue: () => "✓", all: true },
                  { label: "Body composition analysis", getValue: () => "✓", all: true },
                  { label: "Recipe library access", getValue: () => "✓", all: true },
                  { label: "WhatsApp support", getValue: (p) => p.days <= 30 ? "5 days/wk" : p.days <= 60 ? "6 days/wk" : "7 days/wk" },
                  { label: "Macro adjustments", getValue: (p) => p.days >= 60 ? "✓" : "—" },
                  { label: "Progress photo tracking", getValue: (p) => p.days >= 60 ? "✓" : "—" },
                  { label: "CGM integration", getValue: (p) => p.days >= 90 ? "✓" : "—" },
                  { label: "Lab review & adjustments", getValue: (p) => p.days >= 90 ? "✓" : "—" },
                  { label: "Sleep & stress coaching", getValue: (p) => p.days >= 90 ? "✓" : "—" },
                  { label: "Family access", getValue: (p) => p.days >= 365 ? "Up to 3" : "—" },
                  { label: "Concierge support", getValue: (p) => p.days >= 365 ? "24/7" : "—" },
                  { label: "Money-back guarantee", getValue: () => "14 days", all: true },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="p-4 text-muted-foreground">{row.label}</td>
                    {programs.map((p) => (
                      <td key={p.id} className={cn(
                        "p-4 text-center",
                        p.popular && "bg-primary/5",
                        row.getValue(p) === "✓" && "text-primary font-semibold",
                        row.getValue(p) === "—" && "text-muted-foreground/40"
                      )}>
                        {row.getValue(p)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

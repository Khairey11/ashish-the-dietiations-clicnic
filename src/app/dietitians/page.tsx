import Link from "next/link";
import { Star, Globe, ArrowRight, Award, Sparkles } from "lucide-react";
import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { getDbDietitians } from "@/lib/queries";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Meet Our Dietitians",
  description: "Meet the RDN-credentialed clinicians behind Ashish Nutrition Clinic. Specialists in PMOS, diabetes, sports nutrition, pregnancy and more.",
};

export default async function DietitiansPage() {
  const dietitians = await getDbDietitians();
  return (
    <SiteLayout>
      <PageHero
        eyebrow="Meet the team"
        title={<>World-class clinicians who <span className="gradient-text">actually care</span></>}
        description="Every dietitian at Ashish Nutrition Clinic is RDN-credentialed, regularly peer-reviewed, and trained in motivational interviewing. You're not just getting a meal plan — you're getting a partner."
        accent="from-primary/15 to-secondary/10"
      />

      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {dietitians.map((d) => (
              <div
                key={d.id}
                className="group relative rounded-2xl bg-card border border-border/60 overflow-hidden hover:shadow-premium hover:-translate-y-1.5 transition-all duration-300"
              >
                <div className={cn("relative h-28 bg-gradient-to-br", d.accent)}>
                  <div className="absolute inset-0 bg-grid opacity-30" />
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-background/30 backdrop-blur text-foreground border-0 gap-1">
                      <Award className="w-3 h-3" />
                      {d.experience}+ yrs
                    </Badge>
                  </div>
                </div>

                <div className="relative px-5 pb-5 -mt-12">
                  <div className={cn("w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white text-2xl font-bold mb-3 border-4 border-card shadow-premium", d.accent)}>
                    {d.initials}
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">{d.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{d.credentials}</p>
                  <p className="text-sm font-semibold text-primary mt-2">{d.specialty}</p>

                  <div className="flex flex-wrap gap-1 mt-3">
                    {d.focus.map((f) => (
                      <span key={f} className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground">{f}</span>
                    ))}
                  </div>

                  <p className="text-xs text-muted-foreground/90 leading-relaxed mt-3">{d.bio}</p>

                  <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-border/40">
                    <div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-bold">{d.rating}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{d.reviews} reviews</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-primary" />
                        <span className="text-[11px] font-semibold">{d.languages.length}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">languages</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-1.5 text-[11px]">
                    <span className="relative flex w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75" />
                      <span className="relative rounded-full bg-emerald-500 w-2 h-2" />
                    </span>
                    <span className="text-muted-foreground">{d.availability}</span>
                  </div>

                  <Link href="/booking">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                    >
                      Book with {d.name.split(" ")[d.name.split(" ").length - 1]}
                      <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* CTA bar */}
          <div className="mt-12 rounded-3xl bg-gradient-to-r from-primary to-secondary p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-glow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Not sure who to book with?</h3>
                <p className="text-sm text-white/80">Get matched in 60 seconds based on your goals & history.</p>
              </div>
            </div>
            <Link href="/booking">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-white/90">
                Find my dietitian
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

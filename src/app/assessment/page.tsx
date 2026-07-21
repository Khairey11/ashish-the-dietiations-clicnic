import { SiteLayout } from "@/components/site/site-layout";
import { AssessmentForm } from "./assessment-form";

export const metadata = {
  title: "Health Assessment Survey",
  description: "Complete our comprehensive health assessment survey to help your dietitian understand your needs before your consultation. Takes 5-10 minutes.",
  alternates: { canonical: "/assessment" },
};

export default function AssessmentPage() {
  return (
    <SiteLayout>
      <section className="pt-16 pb-8 bg-gradient-to-br from-primary/10 to-secondary/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="container mx-auto px-4 sm:px-6 relative">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              Step 1 of your journey
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-balance leading-[1.05]">
              Health <span className="gradient-text">Assessment Survey</span>
            </h1>
            <p className="mt-5 text-lg text-muted-foreground max-w-2xl">
              Help your dietitian understand your health goals, lifestyle, and medical history
              before your consultation. This takes 5–10 minutes and ensures your first session
              is productive and personalized.
            </p>
          </div>
        </div>
      </section>
      <AssessmentForm />
    </SiteLayout>
  );
}

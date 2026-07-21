import Link from "next/link";
import { CheckCircle2, Clock, Mail, ArrowRight } from "lucide-react";
import { SiteLayout } from "@/components/site/site-layout";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Assessment Submitted",
  description: "Your health assessment has been submitted. Your dietitian will review your information and approve your consultation.",
};

export default function AssessmentSuccessPage() {
  return (
    <SiteLayout>
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">
              Assessment Submitted!
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Thank you for completing the health assessment survey. Here&apos;s what happens next:
            </p>

            <div className="space-y-4 mb-10 text-left">
              {[
                { icon: Clock, title: "Dietitian Review", desc: "Your assigned dietitian will review your assessment within 24-48 hours." },
                { icon: Mail, title: "Approval Notification", desc: "You'll receive an email once your consultation is approved." },
                { icon: CheckCircle2, title: "Book & Pay", desc: "After approval, you can select your package, complete payment, and schedule your appointment." },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-border/60 bg-card">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <step.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-primary">Step {i + 1}</span>
                    </div>
                    <p className="font-semibold text-sm">{step.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/">
                <Button variant="outline">
                  Back to Home
                </Button>
              </Link>
              <Link href="/pricing">
                <Button className="bg-gradient-to-r from-primary to-secondary">
                  View Pricing
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}

import { SiteLayout, PageHero } from "@/components/site/site-layout";
import { About } from "@/components/sections/about";
import { teamMembers, awards, certificationsList } from "@/lib/data";
import { Award, GraduationCap, ShieldCheck, Star } from "lucide-react";

export const metadata = {
  title: "About Us",
  description: "Meet the clinicians, mission and story behind Ashish Nutrition Clinic — a premium nutrition consultancy transforming lives across South Asia since 2018.",
};

export default function AboutPage() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="About us"
        title={<>Built by clinicians, <span className="gradient-text">for humans</span></>}
        description="What started in 2018 with one dietitian and a big idea has grown into a 28-clinician platform that has transformed 12,400+ lives across South Asia."
        accent="from-emerald-500/15 to-teal-500/10"
      />

      <About />

      {/* Team section */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              Meet the team
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              The people behind <span className="gradient-text">your transformation</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              28 credentialed clinicians, technologists and care coordinators — united by one mission.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamMembers.map((m, i) => (
              <div
                key={m.id}
                className="group rounded-2xl bg-card border border-border/60 overflow-hidden hover:shadow-premium hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`relative h-32 bg-gradient-to-br ${m.accent}`}>
                  <div className="absolute inset-0 bg-grid opacity-30" />
                </div>
                <div className="px-5 pb-5 -mt-12">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${m.accent} flex items-center justify-center text-white text-2xl font-bold mb-3 border-4 border-card shadow-premium`}>
                    {m.initials}
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">{m.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.credentials}</p>
                  <p className="text-sm font-semibold text-primary mt-1.5">{m.role}</p>
                  <p className="text-sm text-muted-foreground/90 leading-relaxed mt-3">{m.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {m.specialties.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-medium text-muted-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Experience</span>
                    <span className="font-semibold">{m.yearsExperience}+ years</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              Recognition
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              Awards & <span className="gradient-text">accolades</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {awards.map((a) => (
              <div key={a.title} className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/60">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-primary">{a.year}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">{a.organisation}</span>
                  </div>
                  <h3 className="font-semibold">{a.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{a.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wider uppercase mb-4">
              Trust & compliance
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
              Certified, audited & <span className="gradient-text">compliant</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We hold ourselves to the highest clinical, security and privacy standards.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {certificationsList.map((c) => (
              <div key={c.name} className="p-5 rounded-2xl bg-card border border-border/60">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {c.name.includes("ISO") || c.name.includes("HIPAA") || c.name.includes("GDPR") ? (
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    ) : (
                      <GraduationCap className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
